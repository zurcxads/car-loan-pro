/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (!hasAccepted) {
      // Show banner after a short delay for better UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-5xl mx-auto bg-white  rounded-2xl shadow-2xl border border-gray-200 ">
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 p-3 bg-blue-50  rounded-xl">
              <Cookie className="w-6 h-6 text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900  mb-2">
                We Use Essential Cookies
              </h3>
              <p className="text-sm text-gray-600  mb-4">
                We use essential cookies to make Auto Loan Pro work properly (like keeping you logged in and securing your session).
                We don't use tracking cookies or sell data to advertisers.
                {' '}
                <Link href="/privacy-summary" className="text-blue-600 hover:underline">
                  Learn more
                </Link>
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAccept}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Accept
                </button>
                <button
                  onClick={handleDecline}
                  className="px-6 py-2.5 bg-gray-100  text-gray-800  rounded-lg font-medium hover:bg-gray-200  transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Decline Non-Essential
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDecline}
              className="flex-shrink-0 p-2 text-gray-500  hover:text-gray-700  hover:bg-gray-100  rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
