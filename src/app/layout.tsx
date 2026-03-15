import type { Metadata } from "next";
import localFont from "next/font/local";
import Providers from "@/components/providers/SessionProvider";
import { DevModeProvider } from "@/contexts/DevModeContext";
import DevModeBanner from "@/components/dev/DevModeBanner";
import CookieConsent from "@/components/shared/CookieConsent";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Header from "@/components/shared/Header";
import "./globals.css";

const sansFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Auto Loan Pro — Auto Lending Marketplace",
  description: "Get pre-approved for an auto loan from multiple lenders with one application. No dealer markup.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: "Auto Loan Pro — Auto Lending Marketplace",
    description: "Pre-Approved in Minutes, Not Weeks",
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Auto Loan Pro',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Auto Loan Pro — Auto Lending Marketplace",
    description: "Pre-Approved in Minutes, Not Weeks",
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Auto Loan Pro" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body className={`${sansFont.variable} font-sans bg-white text-gray-900 antialiased`}>
        <a
          href="#main-content"
          className="skip-link focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <DevModeProvider>
            <DevModeBanner />
            <Header />
            <Providers>
              <main id="main-content" role="main" tabIndex={-1}>
                {children}
              </main>
            </Providers>
            <CookieConsent />
          </DevModeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
