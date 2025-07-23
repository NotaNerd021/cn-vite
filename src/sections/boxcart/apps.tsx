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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { githubService, AppReleaseInfo } from "@/services/github";

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

const appIcons = {
  Streisand:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/streisand.jpg",
  Shadowrocket:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/shadowrocket.png",
  V2rayNG:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/v2rayNG.png",
  V2rayN:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/v2rayN.png",
  V2box:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/v2box.png",
  Flclash:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/flclash.png",
  SingBox:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/singbox.png",
};

const AppsTab = ({ url }: AppsTabProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const isRTL = language === "fa" || language === "ar";
  const [releases, setReleases] = useState<{
    v2rayNG: AppReleaseInfo | null;
    v2rayN: AppReleaseInfo | null;
    flclash: AppReleaseInfo | null;
  }>({
    v2rayNG: null,
    v2rayN: null,
    flclash: null,
  });

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const allReleases = await githubService.getAllAppReleases();
        setReleases(allReleases);
      } catch (error) {
        console.error("Failed to fetch app releases:", error);
      }
    };

    fetchReleases();
  }, []);

  const OS_TABS = [
    {
      value: "apple",
      label: t("apple"),
      icon: <IconBrandApple />,
      content: t("appleContent"),
      apps: [
        {
          name: "Streisand",
          icon: (
            <img
              src={appIcons.Streisand}
              alt="Streisand"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          format: "streisand://import/{url}",
          download: "https://apps.apple.com/us/app/streisand/id6450534064",
        },
        {
          name: "V2box",
          icon: (
            <img
              src={appIcons.V2box}
              alt="V2box"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          format: "v2box://install-sub?url={url}&name=MattDev",
          download:
            "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690",
        },
        {
          name: "Shadowrocket",
          icon: (
            <img
              src={appIcons.Shadowrocket}
              alt="Shadowrocket"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          isCustom: true,
          download: "https://apps.apple.com/us/app/shadowrocket/id932747118",
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
          icon: (
            <img
              src={appIcons.V2rayNG}
              alt="V2rayNG"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          format: "v2rayng://install-config?url={url}",
          download:
            (releases.v2rayNG && typeof releases.v2rayNG === "object"
              ? releases.v2rayNG.downloadUrl
              : "") || "",
        },
        {
          name: "V2box",
          icon: (
            <img
              src={appIcons.V2box}
              alt="V2box"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          format: "v2box://install-sub?url={url}&name=MattDev",
          download:
            "https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box",
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
          icon: (
            <img
              src={appIcons.V2rayN}
              alt="V2rayN"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          download:
            (releases.v2rayN && typeof releases.v2rayN === "object"
              ? releases.v2rayN.downloadUrl
              : "") || "",
        },
        {
          name: "Flclash",
          icon: (
            <img
              src={appIcons.Flclash}
              alt="Flclash"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          download:
            (releases.flclash && typeof releases.flclash === "object"
              ? releases.flclash.downloadUrl
              : "") || "",
        },
      ],
    },
  ];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const handleOnClick = (app: App) => {
    setSelectedApp(app);
    setDialogOpen(true);
  };

  const handleImport = () => {
    if (!selectedApp) return;
    if (selectedApp.format) {
      window.open(selectedApp.format.replace("{url}", url), "_blank");
    } else if (selectedApp.isCustom) {
      const encodedURL = btoa(url);
      const shadowrocketLink = "sub://" + encodedURL;
      window.location.href = shadowrocketLink;
    }
    setDialogOpen(false);
  };

  const handleDownload = () => {
    if (!selectedApp) return;
    if (selectedApp.download) {
      window.open(selectedApp.download, "_blank");
    }
    setDialogOpen(false);
  };

  // Check if configs tab should be shown based on environment variable
  const showConfigsTab = import.meta.env.VITE_SHOW_CONFIGS_TAB === "true";

  // Content to render
  const appsContent = (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-[90vw] rounded-2xl p-4 sm:max-w-lg sm:p-6"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="mb-2 text-3xl">{selectedApp?.icon}</div>
              <DialogTitle className="text-center text-xl font-bold">
                {selectedApp?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-center text-base">
                {t("appDialog.description")}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-4">
            {selectedApp?.download && (
              <div className="rounded-lg bg-blue-50 p-3 text-center text-sm text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
                {t("appDialog.hint")}
              </div>
            )}
            <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
              {selectedApp?.format || selectedApp?.isCustom ? (
                <Button className="min-w-[120px] flex-1" onClick={handleImport}>
                  {t("appDialog.import")}
                </Button>
              ) : null}
              {selectedApp?.download ? (
                <Button
                  className="min-w-[120px] flex-1"
                  variant="secondary"
                  onClick={handleDownload}
                >
                  {t("appDialog.download")}
                </Button>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {OS_TABS ? (
        <Tabs
          dir={isRTL ? "rtl" : "ltr"}
          defaultValue="apple"
          className="w-full"
        >
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
      ) : (
        <div className="my-3 h-[250px] rounded-xl px-3 py-2 animate-pulse bg-muted" />
      )}
    </>
  );

  // If configs tab is disabled, return content without TabsContent wrapper
  if (!showConfigsTab) {
    return appsContent;
  }

  // Default mode with TabsContent wrapper
  return <TabsContent value="apps">{appsContent}</TabsContent>;
};

export default AppsTab;
