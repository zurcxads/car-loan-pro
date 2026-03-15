/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("cookieConsent");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (!isVisible || !bannerRef.current) {
      root.style.setProperty("--cookie-banner-offset", "0px");
      return undefined;
    }

    const updateOffset = () => {
      const bannerHeight = bannerRef.current?.offsetHeight ?? 0;
      root.style.setProperty("--cookie-banner-offset", `${bannerHeight + 12}px`);
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(() => updateOffset());
    resizeObserver.observe(bannerRef.current);
    window.addEventListener("resize", updateOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOffset);
      root.style.setProperty("--cookie-banner-offset", "0px");
    };
  }, [isVisible]);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E3E8EE] bg-white/98 shadow-[0_-12px_32px_rgba(10,37,64,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs leading-5 text-[#425466] sm:text-sm">
          We use cookies to improve your experience. Review our{" "}
          <Link href="/privacy" className="font-medium text-[#2563EB] hover:text-blue-700">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={handleAccept}
            className="min-h-11 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="min-h-11 rounded-full border border-[#E3E8EE] bg-white px-5 py-2.5 text-sm font-medium text-[#0A2540] transition-colors hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
