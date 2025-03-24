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

interface ChartProps {
  chartData: [timestamp: string, usage: number][];
  totalUsage: number;
  activeChart: string;
  setActiveChart: (chart: string) => void;
}

export function Chart({
  chartData,
  totalUsage,
  activeChart,
  setActiveChart,
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

  const transformedData = chartData
    ?.map(([timestamp, usage]: [string, number]) => {
      const timestampNumber = Number(timestamp);

      // Guard against invalid timestamps
      if (isNaN(timestampNumber)) return null;

      const date = new Date(timestampNumber * 1000);

      // Format the date to "YYYY-MM-DD"
      const formattedDate = date.toLocaleDateString("en-CA");

      // Format the time to "HH:mm:ss"
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      return {
        date: `${formattedDate} ${formattedTime}`, // Combine both date and time
        usage,
      };
    })
    .filter(Boolean); // Filter out null values

  const formatter = (value: number) => {
    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions = {};

    // Set common options based on activeChart
    switch (activeChart) {
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

      case "six-month":
        options.month = "short";
        break;

      case "yearly":
        options.year = "numeric";
        options.month = "short";
        break;

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
              {formatTraffic(totalUsage, t)}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
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
            <Bar dataKey={"usage"} fill={`var(--chart-1`} />
          </BarChart>
        </ChartContainer>
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
