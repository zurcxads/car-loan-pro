import dynamic from "next/dynamic";
import type { Metadata } from 'next';

const CalculatorPageClient = dynamic(() => import("./CalculatorPageClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center bg-white text-[#6B7C93]">
      Loading calculator...
    </div>
  ),
});

const title = 'Auto Loan Calculator — Auto Loan Pro';
const description = 'Estimate monthly car payments, compare loan terms, and review amortization details with the Auto Loan Pro calculator.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
};

export default function CalculatorPage() {
  return <CalculatorPageClient />;
}
