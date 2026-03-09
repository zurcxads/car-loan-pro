import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Car Loan Pro — Auto Lending Marketplace",
  description: "Get pre-approved for an auto loan from multiple lenders with one application. No dealer markup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlex.variable} font-sans bg-[#09090B] text-zinc-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
