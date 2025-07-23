import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import AppsTab from "@/sections/boxcart/apps";
import ConfigsTab from "@/sections/boxcart/configs";

interface BoxProps {
  readonly username?: string;
  readonly SubURL?: string;
  readonly configs: string;
}

export function Box({ username, configs, SubURL }: BoxProps) {
  const { t } = useTranslation();

  // Check if configs tab should be shown based on environment variable
  const showConfigsTab = import.meta.env.VITE_SHOW_CONFIGS_TAB === "true";

  // If configs tab is disabled, show only apps without tabs
  if (!showConfigsTab) {
    return (
      <Card className="mx-4 md:mx-3 md:ms-5">
        <CardHeader>
          <h3 className="text-lg font-semibold">{t("apps")}</h3>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <AppsTab url={SubURL ?? ""} username={username} />
        </CardContent>
      </Card>
    );
  }

  // Default mode with both tabs
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
          <AppsTab url={SubURL ?? ""} username={username} />
          <ConfigsTab data={configs} />
        </CardContent>
      </Tabs>
    </Card>
  );
}
