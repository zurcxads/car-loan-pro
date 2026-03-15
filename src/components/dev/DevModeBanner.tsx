"use client";

import { useEffect, useState } from 'react';
import { isDevAccessGranted } from '@/lib/env';

export default function DevModeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      setIsVisible(isDevAccessGranted());
    };

    sync();
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);

    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
      DEV
    </div>
  );
}
