import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DevModeProvider } from "@/contexts/DevModeContext";
import DevModeBanner from "@/components/dev/DevModeBanner";
import CookieConsent from "@/components/shared/CookieConsent";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Header from "@/components/shared/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Auto Loan Pro" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <DevModeProvider>
              <DevModeBanner />
              <Header />
              <Providers>{children}</Providers>
              <CookieConsent />
            </DevModeProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
