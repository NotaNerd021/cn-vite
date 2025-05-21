import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import AppsTab from "@/sections/boxcart/apps";
import ConfigsTab from "@/sections/boxcart/configs";

interface BoxProps {
  readonly data: {
    readonly subscription_url: string;
  };
  readonly configs: string;
}

export function Box({ data, configs }: BoxProps) {
  const { t } = useTranslation();
  return (
    <Card className="mx-4 md:mx-3 md:ms-5">
      <Tabs defaultValue="apps">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 md:flex-row mx-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apps">{t("apps")}</TabsTrigger>
            <TabsTrigger value="configs">{t("configs")}</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <AppsTab url={data?.subscription_url} />

          <ConfigsTab data={configs} />
        </CardContent>
      </Tabs>
    </Card>
  );
}
