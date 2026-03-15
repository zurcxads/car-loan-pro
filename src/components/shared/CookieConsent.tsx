/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("cookieConsent");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

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
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[60px] border-t border-[#E3E8EE] bg-white">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <p className="truncate text-sm text-[#425466]">
          We use cookies to improve your experience.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            className="rounded-full bg-[#2563EB] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="rounded-full border border-[#E3E8EE] bg-white px-4 py-2 text-xs font-medium text-[#0A2540] transition-colors hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
