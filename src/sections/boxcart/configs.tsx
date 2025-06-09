import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CopyIcon, QrCodeIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClipboard } from "@custom-react-hooks/use-clipboard";
import QrCode from "@/components/qrcode";
import { extractNameFromConfigURL } from "@/lib/utils";
import { TypeNumber } from "styled-qr-code";
import { useEffect, useState } from "react";

interface ConfigsTabProps {
  data: string;
}

const ConfigsTab = ({ data }: ConfigsTabProps) => {
  const { t } = useTranslation();
  const [dataLinks, setDataLinks] = useState<string[]>([]);

  const { copyToClipboard } = useClipboard();

  const handleCopyToClipboard = async (config: string) => {
    await copyToClipboard(config);
    toast.success(t("linkCopied"));
  };

  useEffect(() => {
    if (data) {
      const links = data?.trim();
      const decodedLinks =
        links.includes("vmess") || links.includes("vless")
          ? links
          : decodeBase64(links);
      const configArray = decodedLinks ? decodedLinks.split("\n") : [];
      setDataLinks(
        configArray[configArray.length - 1] === "False"
          ? configArray.slice(0, -1)
          : configArray
      );
    } else {
      setDataLinks([]);
    }
  }, [data]);

  return (
    <TabsContent value="configs">
      <ScrollArea className="h-[270px] overflow-y-auto">
        {dataLinks?.map((config, index) => (
          <div
            className="my-3 flex cursor-default flex-row justify-between rounded-2xl bg-neutral-100 px-3 py-2 hover:bg-neutral-100 dark:bg-neutral-800 hover:dark:bg-neutral-600"
            key={config + index}
          >
            <h4 className="flex max-w-50 items-center truncate font-normal text-wrap md:max-w-60 lg:max-w-80">
              {extractNameFromConfigURL(config) || "Unknown"}
            </h4>
            <div className="me-1 flex items-center">
              <Button
                className="cursor-pointer"
                size="icon"
                onClick={() => handleCopyToClipboard(config)}
              >
                <CopyIcon />
              </Button>
              <QrCode
                link={config}
                title={extractNameFromConfigURL(config) ?? "Unknown"}
                trigger={
                  <Button className="ms-2 cursor-pointer" size="icon">
                    <QrCodeIcon />
                  </Button>
                }
                typeNumber={
                  Math.max(
                    15,
                    Math.ceil(config?.length / 100 + 11)
                  ) as TypeNumber
                }
              />
            </div>
          </div>
        ))}
      </ScrollArea>
    </TabsContent>
  );
};

export default ConfigsTab;

function decodeBase64(encodedString: string) {
  try {
    const decodedString = atob(encodedString);
    return decodedString;
  } catch (error) {
    console.error("Failed to decode base64:", error);
    return "";
  }
}
