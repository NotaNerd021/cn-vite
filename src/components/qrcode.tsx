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
import QRCodeStyling from 'styled-qr-code';

interface QrCodeProps {
  link: string;
  title: string;
  trigger: React.ReactNode;
}

const QrCode = ({ link, title, trigger }: QrCodeProps) => {
  const theme = useTheme();
  const isDarkMode = theme.theme === 'dark';
  const { t } = useTranslation();
  const { copyToClipboard } = useClipboard();

  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyToClipboard = async (config: string) => {
    await copyToClipboard(config);
    toast.success(t('linkCopied'));
  };

  const qrCode = useMemo(
    () =>
      new QRCodeStyling({
        width: 250,
        height: 250,
        dotsOptions: {
          color: isDarkMode ? 'var(--color-neutral-300)' : 'var(--color-neutral-800)',
          type: 'dots',
        },
        cornersSquareOptions: {
          color: isDarkMode ? 'var(--color-neutral-600)' : 'var(--color-neutral-600)',
          type: 'extra-rounded',
        },
        cornersDotOptions: {
          color: isDarkMode ? 'var(--color-red-400)' : 'var(--color-red-400)',
          type: 'dot',
        },
        qrOptions: {
          errorCorrectionLevel: 'L',
          typeNumber: 15,
        },
        backgroundOptions: {
          color: 'transparent',
        },
        type: 'svg',
      }),
    [isDarkMode]
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        if (ref.current) {
          ref.current.innerHTML = '';
          qrCode.append(ref.current);
          qrCode.update({ data: link || '' });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-wrap">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-2">
          <div
            onClick={() => handleCopyToClipboard(link)}
            ref={ref}
            className={`cursor-pointer py-3 ${isReady ? '' : 'hidden'}`}
          />
          {!isReady || (!link && <Skeleton className="h-[250px] w-[250px] rounded-xl" />)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCode;
