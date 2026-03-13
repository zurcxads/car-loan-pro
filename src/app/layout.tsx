import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Providers from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DevModeProvider } from "@/contexts/DevModeContext";
import DevModeBanner from "@/components/dev/DevModeBanner";
import CookieConsent from "@/components/shared/CookieConsent";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Header from "@/components/shared/Header";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Auto Loan Pro — Auto Lending Marketplace",
  description: "Get pre-approved for an auto loan from multiple lenders with one application. No dealer markup.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Auto Loan Pro" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${ibmPlex.variable} font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased transition-colors`}>
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
