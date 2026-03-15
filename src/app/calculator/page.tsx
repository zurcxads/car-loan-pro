import type { Metadata } from 'next';
import CalculatorPageClient from './CalculatorPageClient';

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
