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
import { QrCodeIcon } from "lucide-react";
import { getStatus } from "./lib/utils";
import { Helmet } from "react-helmet";
import { NetworkMonitor } from "@/lib/performance";

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
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
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

  // Initialize network monitor
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
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
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
        dedupingInterval: 30000, // Cache config data for 30 seconds
        onError: (error) => {
          console.warn("Failed to fetch config data:", error);
        },
      }
    );

    const { data: chartData, error: chartError } = useSWR(
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
        refreshInterval: 60000, // Refresh chart data every minute
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
          expire_date: 0,
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
        case "six-month":
          setStartTime(addDays(new Date(), -180));
          setEndTime(new Date());
          setPeriod("month");
          break;
        case "yearly":
          setStartTime(addDays(new Date(), -365));
          setEndTime(new Date());
          setPeriod("month");
          break;
        default:
          setStartTime(addDays(new Date(), -1));
          setEndTime(new Date());
          setPeriod("hour");
          break;
      }
    };

    const isRTL = language === "fa" || language === "ar";

    // Enhanced error handling with better user feedback
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

    // Loading state with skeleton
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

    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="@container/main flex flex-1 flex-col gap-2 p-5"
      >
        <Helmet>
          <title>{data?.username} Sub Stats</title>
          <meta
            name="description"
            content="Powered by https://github.com/NotANerd021"
          />
        </Helmet>
        <div className="flex flex-col-reverse gap-4 justify-center">
          <div className="block md:flex justify-between flex-row-reverse mx-0 md:mx-6">
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
            </div>
            <h1 className="scroll-m-20 text-3xl font-normal tracking-tight lg:text-4xl text-center py-5 grid-cols-5">
              {t("subStats")}
            </h1>
          </div>
        </div>
        <Suspense fallback="loading...">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards cardsData={cardsData} />
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-0 gap-4">
              <Box
                username={data?.username}
                SubURL={getAdjustedUrl(data?.subscription_url)}
                configs={configData}
              />
              <Chart
                chartData={isMarzneshin ? chartData?.usages : chartData}
                totalUsage={isMarzneshin && chartData?.total}
                activeChart={activeChart}
                setActiveChart={updateChart}
              />
            </div>
          </div>
        </Suspense>
      </div>
    );
}

export default App;
