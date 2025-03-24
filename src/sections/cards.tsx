import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, isThisWeek, isToday } from "date-fns";
import { useTranslation } from "react-i18next";

interface SectionCardsProps {
  cardsData: {
    data_limit: number;
    totalTraffic: number;
    expire_date: string;
    status: string;
    username: string;
    online_at: string;
  };
}

export function SectionCards({
  cardsData: { data_limit, totalTraffic, expire_date, status, username, online_at },
}: SectionCardsProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const isRTL = language === "fa" || language === "ar";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6"
    >
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t("username")}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {t(username)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t("status")}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {t(status)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t("online_at")}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formatDate(online_at)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t("data_limit")}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formatTraffic(data_limit, t)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t("remainingTraffic")}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formatTraffic(data_limit - totalTraffic, t)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t("remainingTime")}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {calculateRemainingTime(expire_date, t)}
          </CardTitle>
        </CardHeader>
      </Card>
      
    </div>
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

const calculateRemainingTime = (
  expire: string | null,
  t: (key: string) => string
): string => {
  if (!expire || expire === null) return t("infinity");

  let expireTimestamp;
  if (typeof expire === "number") {
    expireTimestamp = expire;
  } else if (typeof expire === "string") {
    expireTimestamp = Math.floor(new Date(expire).getTime() / 1000);
  } else {
    throw new Error("Invalid expire format");
  }

  const remainingSeconds = expireTimestamp - Math.floor(Date.now() / 1000);
  if (remainingSeconds <= 0) return t("expired");

  const days = Math.floor(remainingSeconds / (60 * 60 * 24));
  const hours = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

  if (days > 0) return `${days} ${t("day")}`;
  if (hours > 0) return `${hours} ${t("hour")}`;
  if (minutes > 0) return `${minutes} ${t("minute")}`;

  return "∞";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (!dateString) return "∞";

  // Check if the date is today
  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  // Check if the date is in this week
  if (isThisWeek(date)) {
    return format(date, "eeee HH:mm");
  }

  // For dates in other months
  return format(date, "MM dd HH:mm");
};