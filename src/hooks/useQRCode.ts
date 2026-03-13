import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function useQRCode(text: string) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!text) {
      setLoading(false);
      return;
    }

    QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrCodeUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [text]);

  return { qrCodeUrl, loading, error };
}
