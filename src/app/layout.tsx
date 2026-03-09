import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Car Loan Pro — Auto Lending Marketplace",
  description: "Get pre-approved for an auto loan from multiple lenders with one application. No dealer markup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090B] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
