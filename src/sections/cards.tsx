import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateRemainingTime, formatDate, formatTraffic } from "@/lib/utils";
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

export function SectionCards({ cardsData }: SectionCardsProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const isRTL = language === "fa" || language === "ar";

  const { data_limit, totalTraffic, expire_date, status, username, online_at } =
    cardsData;

  const remainingTrafficBytes = data_limit - totalTraffic;
  let remainedTraffic: string;

  if (remainingTrafficBytes < 0) {
    remainedTraffic = t("limited");
  } else if (remainingTrafficBytes > 0) {
    remainedTraffic = formatTraffic(remainingTrafficBytes, t);
  } else {
    remainedTraffic = t("infinity");
  }
  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="@xl/main:grid-cols-2 @5xl/main:grid-cols-3 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6"
    >
      <InfoCard label={t("username")} value={t(username)} />
      <InfoCard label={t("status")} value={t(status)} />
      <InfoCard label={t("online_at")} value={formatDate(online_at)} />
      <InfoCard label={t("data_limit")} value={formatTraffic(data_limit, t)} />
      <InfoCard label={t("remainingTraffic")} value={remainedTraffic} />
      <InfoCard
        label={t("remainingTime")}
        value={calculateRemainingTime(expire_date, t)}
      />
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
