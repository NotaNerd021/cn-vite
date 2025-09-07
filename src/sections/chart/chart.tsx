"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";
import { SelectDateView } from "@/sections/chart/time-picker";
import { Loader2 } from "lucide-react";

type MarzneshinFormat = [string, number][];
type MarzbanFormat = {
  period: string;
  start: string;
  end: string;
  stats: { [key: string]: { total_traffic: number; period_start: string }[] };
};
interface ChartProps {
  chartData: [string, number][] | MarzbanFormat;
  totalUsage: number;
  activeChart: string;
  setActiveChart: (chart: string) => void;
  isChartLoading?: boolean;
}

function normalizeChartData(
  data: MarzneshinFormat | MarzbanFormat
): [string, number][] {
  if (Array.isArray(data)) {
    return data;
  }

  const statsKey = Object.keys(data?.stats || {})[0];
  const statsArray = data?.stats?.[statsKey];

  if (!statsArray || !Array.isArray(statsArray)) {
    return [];
  }

  return statsArray.map(({ total_traffic, period_start }) => [
    String(Math.floor(new Date(period_start).getTime() / 1000)),
    total_traffic,
  ]);
}

function getTotalUsage(
  data:
    | { [key: string]: { total_traffic: number; period_start: string }[] }
    | { total_traffic: number; period_start: string }[]
): number {
  let statsArray: { total_traffic: number; period_start: string }[];

  if (Array.isArray(data)) {
    statsArray = data;
  } else {
    const statsKey = Object.keys(data || {})[0];
    statsArray = data?.[statsKey] || [];
  }

  if (!Array.isArray(statsArray) || statsArray.length === 0) return 0;

  return statsArray.reduce((sum, item) => sum + item.total_traffic, 0);
}

export function Chart({
  chartData,
  totalUsage,
  activeChart,
  setActiveChart,
  isChartLoading,
}: ChartProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const isRTL = language === "fa" || language === "ar";

  const chartConfig = {
    usage: {
      label: t("usage"),
    },
  } satisfies ChartConfig;

  const normalizedData = normalizeChartData(chartData);

  const transformedData = normalizedData
    ?.map(([timestamp, usage]: [string, number]) => {
      const timestampNumber = Number(timestamp);
      if (isNaN(timestampNumber)) return null;

      const date = new Date(timestampNumber * 1000);
      const formattedDate = date.toLocaleDateString("en-CA");
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      return {
        date: `${formattedDate} ${formattedTime}`,
        usage,
      };
    })
    .filter(Boolean);

  const formatter = (value: number) => {
    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions = {};

    switch (activeChart) {
      case "three-month":
        options.day = "numeric";
        options.month = "short";
        break;
        
      case "monthly":
        options.day = "numeric";
        options.month = "short";
        break;

      case "weekly":
        options.day = "numeric";
        options.month = "short";
        options.weekday = "short";
        break;

      case "daily":
        options.hour = "numeric";
        options.minute = "numeric";
        options.hour12 = false;
        return date.toLocaleTimeString("en-US", options);

      default:
        options.day = "numeric";
        options.month = "short";
        break;
    }

    return date.toLocaleDateString("en-US", options);
  };

  return (
    <Card className="mx-4 md:me-6 md:ms-2">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 md:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{t("chartTitle")}</CardTitle>
          <CardDescription>{t("chartDescription")}</CardDescription>
        </div>
        <div className="flex">
          <button className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span
              className={
                "text-xs text-muted-foreground " + (isRTL ? "text-right" : "")
              }
            >
              {t("totalUsage")}
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {formatTraffic(
                Array.isArray(chartData)
                  ? totalUsage
                  : getTotalUsage((chartData as MarzbanFormat)?.stats),
                t
              )}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <div className="relative">
          {isChartLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[200px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={transformedData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={14}
                tickFormatter={(value) => formatter(value)}
              />
              <YAxis
                direction={"ltr"}
                dataKey="usage"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tickFormatter={(value) => formatTraffic2Degits(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="usage"
                    labelFormatter={(value) => formatter(value)}
                    formatter={(value) =>
                      typeof value === "number" ? formatTraffic(value, t) : ""
                    }
                  />
                }
              />
              <Bar dataKey={"usage"} fill="var(--color-chart-1)" />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="flex justify-center mt-5">
          <SelectDateView
            setTimeRange={setActiveChart}
            timeRange={activeChart}
          />
        </div>
      </CardContent>
    </Card>
  );
}

const formatTraffic = (bytes: number | null, t: (key: string) => string) => {
  if (bytes === null) {
    return t("infinity");
  }
  if (bytes < 0) {
    return t("GB");
  }
  const units = [t("B"), t("KB"), t("MB"), t("GB"), t("TB")];
  const thresholds = [1, 1024, 1024 ** 2, 1024 ** 3];
  for (let i = 0; i < thresholds.length; i++) {
    if (bytes < thresholds[i] * 1024) {
      return `${(bytes / thresholds[i]).toFixed()} ${units[i]}`;
    }
  }
  return `${(bytes / 1024 ** 4).toFixed(2)} ${t("TB")}`;
};

const formatTraffic2Degits = (bytes: number | null) => {
  if (bytes === null) {
    return "infinity";
  }
  if (bytes < 0) {
    return "GB";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const thresholds = [1, 1024, 1024 ** 2, 1024 ** 3];
  for (let i = 0; i < thresholds.length; i++) {
    if (bytes < thresholds[i] * 1024) {
      return `${(bytes / thresholds[i]).toFixed()} ${units[i]}`;
    }
  }
  return `${(bytes / 1024 ** 4).toFixed(2)} ${"TB"}`;
};