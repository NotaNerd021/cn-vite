import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/use-theme';
import { useClipboard } from '@custom-react-hooks/use-clipboard';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import QRCodeStyling, { TypeNumber } from "styled-qr-code";
import { Button } from "./ui/button";

interface QrCodeProps {
  link: string;
  title: string;
  trigger: React.ReactNode;
  typeNumber?: TypeNumber | undefined;
}

const QrCode = ({ link, title, trigger, typeNumber }: QrCodeProps) => {
  const theme = useTheme();
  const isDarkMode = theme.theme === "dark";
  const { t } = useTranslation();
  const { copyToClipboard } = useClipboard();

  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyToClipboard = async (config: string) => {
    await copyToClipboard(config);
    toast.success(t("linkCopied"));
  };

  const qrCode = useMemo(
    () =>
      new QRCodeStyling({
        width: 250,
        height: 250,
        dotsOptions: {
          color: isDarkMode
            ? "var(--color-neutral-300)"
            : "var(--color-neutral-800)",
          type: "dots",
        },
        cornersSquareOptions: {
          color: "var(--color-neutral-600)",
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: "var(--color-red-400)",
          type: "dot",
        },
        qrOptions: {
          errorCorrectionLevel: "L",
          typeNumber: typeNumber ?? 15,
        },
        backgroundOptions: {
          color: "transparent",
        },
        type: "svg",
      }),
    [isDarkMode, typeNumber]
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        if (ref.current) {
          ref.current.innerHTML = "";
          qrCode.append(ref.current);
          qrCode.update({ data: link || "" });
          setIsReady(true);
        }
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, qrCode, link]);

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setIsReady(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-center text-wrap">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center p-2">
          <div ref={ref} className={`py-3 ${isReady ? "" : "hidden"}`} />
          <Button
            onClick={() => handleCopyToClipboard(link)}
            className={`mt-4 cursor-pointer px-4 py-2 ${
              isReady ? "" : "hidden"
            }`}
          >
            {t("copy")}
          </Button>
          {(!isReady || !link) && (
            <Skeleton className="h-[250px] w-[250px] rounded-xl" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCode;
