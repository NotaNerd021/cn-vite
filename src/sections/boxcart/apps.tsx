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
  username?: string;
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
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/flclash.jpg",
  SingBox:
    "https://raw.githubusercontent.com/MatinDehghanian/public-assets/refs/heads/main/icons/singbox.png",
};

const AppsTab = ({ url, username }: AppsTabProps) => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        setError(null);
        const allReleases = await githubService.getAllAppReleases();
        setReleases(allReleases);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch app releases";
        console.warn("Failed to fetch app releases:", error);
        setError(errorMessage);
        // Set fallback releases with empty download URLs
        setReleases({
          v2rayNG: null,
          v2rayN: null,
          flclash: null,
        });
      } finally {
        setLoading(false);
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
          format: `streisand://import/{url}#MattSub-${username}`,
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
          format: `v2box://install-sub?url={url}&name=Mattsub-${username}`,
          download:
            "https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690",
        },
        {
          name: "SingBox",
          icon: (
            <img
              src={appIcons.SingBox}
              alt="SingBox"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          format: `sing-box://import-remote-profile?url={url}#MattSub-${username}`,
          download: "https://apps.apple.com/us/app/sing-box-vt/id6673731168",
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
          format: `v2rayng://install-config?url={url}#MattSub-${username}`,
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
          format: `v2box://install-sub?url={url}&name=MattSub-${username}`,
          download:
            "https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box",
        },
        {
          name: "SingBox",
          icon: (
            <img
              src={appIcons.SingBox}
              alt="SingBox"
              className="mx-auto h-12 w-12 rounded-lg object-cover"
            />
          ),
          format: `sing-box://import-remote-profile?url={url}#MattSub-${username}`,
          download:
            "https://play.google.com/store/apps/details?id=io.nekohasekai.sfa&hl=en",
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

  // Show loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {t("failedToLoad") || "Failed to load app data"}
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          {t("retry") || "Retry"}
        </Button>
      </div>
    );
  }

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
                    {tab?.apps?.map((app) => {
                      // Check if download URL is missing for GitHub-dependent apps
                      const isGitHubApp = [
                        "V2rayNG",
                        "V2rayN",
                        "Flclash",
                      ].includes(app.name);
                      const hasDownloadUrl =
                        app.download && app.download.trim() !== "";
                      const showUnavailable = isGitHubApp && !hasDownloadUrl;

                      return (
                        <Card
                          key={app.name}
                          className={`transition-colors duration-200 ${
                            showUnavailable
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-neutral-100 hover:dark:bg-neutral-600 cursor-pointer"
                          }`}
                          role="button"
                          onClick={() => !showUnavailable && handleOnClick(app)}
                        >
                          <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                              {app.name}
                              {showUnavailable && (
                                <span className="text-xs text-red-500">
                                  ({t("unavailable") || "Unavailable"})
                                </span>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex justify-center">
                            {app.icon}
                          </CardContent>
                        </Card>
                      );
                    })}
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
