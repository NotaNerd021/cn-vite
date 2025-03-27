import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandWindowsFilled,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { JSX } from "react";

interface AppsTabProps {
  url: string;
}

interface App {
  name: string;
  icon: JSX.Element;
  format?: string;
  download?: string;
  isCustom?: boolean;
}

const AppsTab = ({ url }: AppsTabProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const isRTL = language === "fa" || language === "ar";

  const OS_TABS = [
    {
      value: "apple",
      label: t("apple"),
      icon: <IconBrandApple />,
      content: t("appleContent"),
      apps: [
        {
          name: "Streisand",
          icon: <IconBrandApple />,
          format: "streisand://import/{url}",
        },
        {
          name: "V2box",
          icon: <IconBrandApple />,
          format: "v2box://install-sub?url={url}&name=MattDev",
        },
        {
          name: "Shadowrocket",
          icon: <IconBrandApple />,
          isCustom: true,
        },
      ],
    },
    {
      value: "android",
      label: t("android"),
      icon: <IconBrandAndroid />,
      content: t("androidContent"),
      apps: [
        {
          name: "V2rayNG",
          icon: <IconBrandAndroid />,
          format: "v2rayng://install-config?url={url}",
        },
        {
          name: "V2box",
          icon: <IconBrandAndroid />,
          format: "v2box://install-sub?url={url}&name=MattDev",
        },
      ],
    },
    {
      value: "windows",
      label: t("windows"),
      icon: <IconBrandWindowsFilled />,
      content: t("windowsContent"),
      apps: [
        {
          name: "V2rayN",
          icon: <IconBrandWindowsFilled />,
          download:
            "https://github.com/2dust/v2rayN/releases/download/7.10.5/v2rayN-windows-64-SelfContained.zip",
        },
        {
          name: "Flclash",
          icon: <IconBrandWindowsFilled />,
          download:
            "https://github.com/chen08209/FlClash/releases/download/v0.8.80/FlClash-0.8.80-windows-amd64-setup.exe",
        },
      ],
    },
  ];

  const handleOnClick = (app: App) => {
    if (app.download) {
      window.open(app.download, "_blank");
    } else if (app.format) {
      window.open(app.format.replace("{url}", url), "_blank");
    } else if (app.isCustom) {
      const encodedURL = btoa(url);
      const shadowrocketLink = "sub://" + encodedURL;
      window.location.href = shadowrocketLink;
    } else return;
  };

  return (
    <TabsContent value="apps">
      <Tabs dir={isRTL ? "rtl" : "ltr"} defaultValue="apple" className="w-full">
        {/* Tabs Navigation */}
        <TabsList className="w-full flex justify-center gap-2">
          {OS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tabs Content */}
        {OS_TABS.map((tab) => (
          <TabsContent className="my-4" key={tab.value} value={tab.value}>
            <Card>
              <CardHeader>
                <CardTitle>{tab.label}</CardTitle>
                <CardDescription>{tab.content}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tab?.apps?.map((app) => (
                    <Card
                      key={app.name}
                      className="hover:bg-neutral-100 hover:dark:bg-neutral-600 cursor-pointer transition-colors duration-200"
                      role="button"
                      onClick={() => handleOnClick(app)}
                    >
                      <CardHeader className="text-center">
                        <CardTitle>{app.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                        {app.icon}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </TabsContent>
  );
};

export default AppsTab;
