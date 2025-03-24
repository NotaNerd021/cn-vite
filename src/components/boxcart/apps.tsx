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

const AppsTab = () => {
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
        },
        {
          name: "V2box",
          icon: <IconBrandApple />,
        },
        {
          name: "V2rayU",
          icon: <IconBrandApple />,
        },
      ],
    },
    {
      value: "android",
      label: t("android"),
      icon: <IconBrandAndroid />,
      content: "Change your password here.",
      apps: [
        {
          name: "V2rayNG",
          icon: <IconBrandAndroid />,
        },
        {
          name: "V2rayGO",
          icon: <IconBrandAndroid />,
        },
        {
          name: "V2rayDroid",
          icon: <IconBrandAndroid />,
        },
      ],
    },
    {
      value: "windows",
      label: t("windows"),
      icon: <IconBrandWindowsFilled />,
      content: "Make changes to your account here.",
      apps: [
        {
          name: "V2rayN",
          icon: <IconBrandWindowsFilled />,
        },
        {
          name: "V2rayW",
          icon: <IconBrandWindowsFilled />,
        },
      ],
    },
  ];

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
                      // onClick={app.onClick}
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
