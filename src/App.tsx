import { Chart } from "@/sections/chart/chart";
import { SectionCards } from "@/sections/cards";
import LanguageSelector from "@/sections/nav/lang";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "@/sections/nav/theme-toggle";
import { Suspense, useState, useEffect } from "react";
import { addDays } from "date-fns";
import useSWR from "swr";
import { Box } from "@/sections/boxcart/box";
import QrCode from "./components/qrcode";
import { Button } from "./components/ui/button";
import { QrCodeIcon, MessageSquare } from "lucide-react";
import { getStatus, cn } from "./lib/utils";
import { Helmet } from "react-helmet";
import { NetworkMonitor } from "@/lib/performance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CardsData {
  totalTraffic: number;
  data_limit: number;
  expire_date: string;
  status: string;
  username: string;
  online_at: string;
}

const fetcher = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json, text/plain, */*'
      }
    });
    
    clearTimeout(timeoutId);
    
    const contentType = res.headers.get("content-type");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    if (contentType?.includes("application/json")) {
      return res.json();
    } else {
      return res.text();
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    
    throw error;
  }
};
function App() {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [activeChart, setActiveChart] = useState("daily");
  const [startTime, setStartTime] = useState(addDays(new Date(), -1));
  const [endTime, setEndTime] = useState(new Date());
  const [period, setPeriod] = useState("hour");

  useEffect(() => {
    NetworkMonitor.init();
  }, []);

  const { data, error, isLoading } = useSWR(
    `${import.meta.env?.VITE_PANEL_DOMAIN || window.location.origin}${
      window.location.pathname
    }/info`,
    fetcher,
    {
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateOnFocus: false,
      refreshInterval: 30000,
      dedupingInterval: 10000,
      onError: (error) => {
        console.warn('Failed to fetch user info:', error);
      }
    }
  );

    const getAdjustedUrl = (subURL: string | undefined) => {
      if (!subURL && !import.meta.env.VITE_PANEL_DOMAIN) {
        return `${window.location.origin}${window.location.pathname}`;
      }
      if (!subURL && import.meta.env.VITE_PANEL_DOMAIN) {
        return `${import.meta.env.VITE_PANEL_DOMAIN}${
          window.location.pathname
        }`;
      }
      if (import.meta.env.VITE_PANEL_DOMAIN && subURL) {
        return subURL.replace(
          /https?:\/\/[^/]+/,
          import.meta.env.VITE_PANEL_DOMAIN
        );
      } else if (subURL?.includes("https://")) {
        return subURL;
      }

      return `${window.location.origin}${subURL}`;
    };

    const isMarzneshin =
      new URL(window.location.href).pathname.split("/").filter(Boolean)
        .length === 3;

    const { data: configData } = useSWR(
      `${import.meta.env?.VITE_PANEL_DOMAIN ?? window.location.origin}${
        window.location.pathname
      }/links`,
      fetcher,
      {
        errorRetryCount: 2,
        errorRetryInterval: 3000,
        revalidateOnFocus: false,
        dedupingInterval: 30000,
        onError: (error) => {
          console.warn("Failed to fetch config data:", error);
        },
      }
    );

    const { data: chartData, error: chartError, isValidating: isChartLoading } = useSWR(
      `${import.meta.env?.VITE_PANEL_DOMAIN ?? window.location.origin}${
        window.location.pathname
      }/usage?start=${startTime.toISOString()}&end=${endTime.toISOString()}${
        !isMarzneshin ? `&period=${period}` : ""
      }`,
      fetcher,
      {
        errorRetryCount: 2,
        errorRetryInterval: 2000,
        revalidateOnFocus: false,
        refreshInterval: 60000,
        dedupingInterval: 5000,
        onError: (error) => {
          console.warn("Failed to fetch chart data:", error);
        },
      }
    );

    const cardsData: CardsData = data
      ? {
          totalTraffic: data.used_traffic,
          data_limit: data.data_limit,
          expire_date: isMarzneshin ? data.expire_date : data.expire,
          status: getStatus(data, isMarzneshin, t),
          username: data.username,
          online_at: data.online_at,
        }
      : {
          totalTraffic: 0,
          data_limit: 0,
          expire_date: "0",
          status: t("inactive"),
          username: "",
          online_at: "",
        };

    const updateChart = (chart: string) => {
      setActiveChart(chart);

      switch (chart) {
        case "daily":
          setStartTime(addDays(new Date(), -1));
          setEndTime(new Date());
          setPeriod("hour");
          break;
        case "weekly":
          setStartTime(addDays(new Date(), -7));
          setEndTime(new Date());
          setPeriod("day");
          break;
        case "monthly":
          setStartTime(addDays(new Date(), -30));
          setEndTime(new Date());
          setPeriod("day");
          break;
        case "three-month":
          setStartTime(addDays(new Date(), -90));
          setEndTime(new Date());
          setPeriod("day");
          break;
        default:
          setStartTime(addDays(new Date(), -1));
          setEndTime(new Date());
          setPeriod("hour");
          break;
      }
    };

    const isRTL = language === "fa" || language === "ar";

    if (error || chartError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-600">
              {t("connectionError") || "Connection Error"}
            </h2>
            <p className="text-gray-600">
              {error?.message ||
                chartError?.message ||
                t("serverDown") ||
                "Server might be temporarily unavailable"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              {t("retry") || "Retry"}
            </Button>
          </div>
        </div>
      );
    }

    if (isLoading || !data) {
      return (
        <div className="@container/main flex flex-1 flex-col gap-2 p-5">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      );
    }

    const motionProps = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 },
    };

    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="@container/main flex flex-1 flex-col gap-2 p-5"
      >
        <Helmet>
          <title>{`${data?.username || 'Loading...'} Sub Stats`}</title>
          <meta
            name="description"
            content="Powered by https://github.com/NotANerd021"
          />
        </Helmet>
        <div className="flex flex-col-reverse gap-4 justify-center">
          <div
            className={cn("block md:flex justify-between mx-0 md:mx-6", {
              "flex-row-reverse": isRTL,
            })}
          >
            <div className="flex flex-row items-center justify-center mx-5 md:mx-0 gap-3">
              <LanguageSelector />
              <ModeToggle />
              <QrCode
                link={getAdjustedUrl(data?.subscription_url)}
                title={t("subQrcode")}
                trigger={
                  <Button variant="outline" size="icon">
                    <QrCodeIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all" />
                  </Button>
                }
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="https://t.me/VIPsub13" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon">
                        <MessageSquare className="h-[1.2rem] w-[1.2rem]" />
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("support")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center justify-center gap-3 md:gap-4 py-5">
              <img
                src="https://raw.githubusercontent.com/NotaNerd021/Sub1/refs/heads/main/icons/logo1.png"
                alt="Service Logo"
                className="h-10 w-10 md:h-12 md:w-12"
              />
              <h1 className="scroll-m-20 text-3xl font-normal tracking-tight lg:text-4xl">
                {t("subStats")}
              </h1>
            </div>
          </div>
        </div>
        <Suspense fallback="loading...">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* --- MOBILE VIEW --- */}
            <Tabs
              defaultValue="overview"
              className="w-full md:hidden"
              dir={isRTL ? "rtl" : "ltr"}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
                <TabsTrigger value="configs">{t('tabs.configs')}</TabsTrigger>
                <TabsTrigger value="usage">{t('tabs.usage')}</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <motion.div key="overview" {...motionProps}>
                  <SectionCards cardsData={cardsData} />
                </motion.div>
              </TabsContent>
              <TabsContent value="configs" className="mt-4">
                <motion.div key="configs" {...motionProps}>
                  <Box
                    username={data?.username}
                    SubURL={getAdjustedUrl(data?.subscription_url)}
                    configs={configData}
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="usage" className="mt-4">
                <motion.div key="usage" {...motionProps}>
                  <Chart
                    isChartLoading={isChartLoading}
                    chartData={isMarzneshin ? chartData?.usages : chartData}
                    totalUsage={(isMarzneshin && chartData?.total) || 0}
                    activeChart={activeChart}
                    setActiveChart={updateChart}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:flex flex-col gap-4 md:gap-6">
              <SectionCards cardsData={cardsData} />
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-0 gap-4">
                <Box
                  username={data?.username}
                  SubURL={getAdjustedUrl(data?.subscription_url)}
                  configs={configData}
                />
                <Chart
                  isChartLoading={isChartLoading}
                  chartData={isMarzneshin ? chartData?.usages : chartData}
                  totalUsage={(isMarzneshin && chartData?.total) || 0}
                  activeChart={activeChart}
                  setActiveChart={updateChart}
                />
              </div>
            </div>
          </div>
        </Suspense>
      </div>
    );
}

export default App;