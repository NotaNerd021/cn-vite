import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateRemainingTime,
  formatDate,
  formatTraffic,
  naiveAsUTC,
} from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";

interface SectionCardsProps {
  cardsData: {
    data_limit: number;
    totalTraffic: number;
    expire_date: string;
    status: string;
    username: string;
    online_at: string | null;
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

  const remainingTrafficBytes = data_limit > 0 ? data_limit - totalTraffic : 0;
  let remainedTraffic: string;

  if (data_limit === 0) {
    remainedTraffic = t("infinity");
  } else if (remainingTrafficBytes < 0) {
    remainedTraffic = t("limited");
  } else {
    remainedTraffic = formatTraffic(remainingTrafficBytes, t);
  }

  const usagePercentage =
    data_limit > 0 ? (totalTraffic / data_limit) * 100 : 0;

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* --- Main Hero Grid --- */}
      <div className="grid grid-cols-1 @xl/main:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardDescription>{t("remainingTraffic")}</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {remainedTraffic}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data_limit > 0 && (
              <>
                <Progress value={usagePercentage} className="h-2" />
                <div className="flex items-center flex-nowrap text-xs text-muted-foreground mt-2">
                  {isRTL ? (
                    <>
                      <span>{formatTraffic(totalTraffic, t)}</span>
                      <span className="mx-1">از</span>
                      <span>{formatTraffic(data_limit, t)}</span>
                      <span className="mr-1">مصرف شده</span>
                    </>
                  ) : (
                    <>
                      <span>{formatTraffic(totalTraffic, t)}</span>
                      <span className="mx-1">of</span>
                      <span>{formatTraffic(data_limit, t)}</span>
                      <span className="ml-1">used</span>
                    </>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardDescription>{t("remainingTime")}</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {calculateRemainingTime(expire_date, t)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* --- Secondary Info Grid --- */}
      <div className="grid grid-cols-2 @xl/main:grid-cols-4 gap-4">
        <InfoCard label={t("username")} value={username} />
        <InfoCard label={t("status")} value={t(status)} />
        <InfoCard
          label={t("online_at")}
          value={formatDate(naiveAsUTC(online_at) ?? "")}
        />
        <InfoCard
          label={t("data_limit")}
          value={formatTraffic(data_limit, t)}
        />
      </div>
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
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}