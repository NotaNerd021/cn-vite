import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const fetcher = (url: string) => fetch(url).then((res) => res.text());

const ConfigsTab = () => {
  const { t } = useTranslation();

  const { data, error, isLoading, isValidating } = useSWR(
    `${import.meta.env?.VITE_PANEL_DOMAIN || window.location.origin}${
      window.location.pathname
    }`,
    fetcher
  );

  if (error) return <div>Error loading configs</div>;
  if (isLoading || isValidating) return <div>Loading...</div>;
  if (!data) return <div>No configs found</div>;

  const decodedLinks =
    data.includes("vmess") || data.includes("vless")
      ? data
      : decodeBase64(data);
  const configArray = decodedLinks
    ? decodedLinks.split("\n").filter(Boolean)
    : [];

  return (
    <TabsContent value="configs">
      <Table className="ms-4">
        <TableBody className="h-[330px] overflow-y-auto">
          {configArray.map((config, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium max-w-[190px] md:max-w-[190px] lg:max-w-[300px] xl:max-w-[380px] truncate">
                {extractNameFromConfigURL(config) || "Unknown"}
              </TableCell>
              <TableCell>
                <Button
                  className="me-1"
                  onClick={() => handleCopyToClipboard(config, t)}
                >
                  <CopyIcon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TabsContent>
  );
};

export default ConfigsTab;

function decodeBase64(encodedString: string) {
  try {
    return atob(encodedString);
  } catch (error) {
    console.error("Failed to decode base64:", error);
    return "";
  }
}

function extractNameFromConfigURL(url: string) {
  const namePattern = /#([^#]*)/;
  const match = url.match(namePattern);

  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch (error) {
      console.error("Malformed URI component:", match[1], error);
      return match[1];
    }
  }

  if (url.startsWith("vmess://")) {
    const encodedString = url.replace("vmess://", "");

    try {
      const decodedString = atob(encodedString);
      const parsedData = JSON.parse(decodedString);
      return parsedData.ps || "Unnamed Config";
    } catch (error) {
      console.error("Invalid vmess URL format:", error);
      return "Invalid Config";
    }
  }

  return "Unknown";
}

const handleCopyToClipboard = (
  text: string,
  t: ((key: string) => string) | undefined
) => {
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof t === "function") {
        toast.success(t("linkCopied"));
      } else {
        toast.success("Link copied");
      }
    } catch {
      fallbackCopy(text, t);
    }
  };

  const fallbackCopy = (
    text: string,
    t: ((key: string) => string) | undefined
  ) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    if (typeof t === "function") {
      toast.success(t("linkCopied"));
    } else {
      toast.success("Link copied");
    }
  };

  copyText();
};
