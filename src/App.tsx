import { Chart } from "@/sections/chart/chart";
import { SectionCards } from "@/sections/cards";
import LanguageSelector from "@/sections/nav/lang";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "@/sections/nav/theme-toggle";
import { Suspense, useState } from "react";
import { addDays } from "date-fns";
import useSWR from "swr";
import { Box } from "@/sections/boxcart/box";
import QrCode from "./components/qrcode";
import { Button } from "./components/ui/button";
import { QrCodeIcon } from "lucide-react";
import { getStatus } from "./lib/utils";

interface CardsData {
  totalTraffic: number;
  data_limit: number;
  expire_date: string;
  status: string;
  username: string;
  online_at: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const contentType = res.headers.get("content-type");

  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);

  if (contentType?.includes("application/json")) {
    return res.json();
  } else {
    return res.text();
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

  const { data, error } = useSWR(
    `${import.meta.env?.VITE_PANEL_DOMAIN || window.location.origin}${
      window.location.pathname
    }/info`,
    fetcher
  );

  const isMarzneshin =
    new URL(window.location.href).pathname.split("/").filter(Boolean).length ===
    3;

  const { data: configData } = useSWR(
    `${import.meta.env?.VITE_PANEL_DOMAIN ?? window.location.origin}${
      window.location.pathname
    }/links`,
    fetcher
  );

  const { data: chartData, error: chartError } = useSWR(
    `${import.meta.env?.VITE_PANEL_DOMAIN ?? window.location.origin}${
      window.location.pathname
    }/usage?start=${startTime.toISOString()}&end=${endTime.toISOString()}${
      !isMarzneshin ? `&period=${period}` : ""
    }`,
    fetcher
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

  if (error || chartError) return <div>Error loading data...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="@container/main flex flex-1 flex-col gap-2 p-5"
    >
      <div className="flex flex-col-reverse gap-4 justify-center">
        <div className="block md:flex justify-between flex-row-reverse mx-0 md:mx-6">
          <div className="flex flex-row items-center justify-center mx-5 md:mx-0 gap-3">
            <LanguageSelector />
            <ModeToggle />
            <QrCode
              link={data?.subscription_url || window.location.href}
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
            <Box data={data} configs={configData} />
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