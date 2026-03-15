import type { Metadata } from 'next';
import ResultsPageClient from './ResultsPageClient';

const title = 'Your Offers — Auto Loan Pro';
const description = 'Review your personalized Auto Loan Pro offers, compare terms side by side, and choose the financing option that fits your budget.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
};

export default function ResultsPage() {
  return <ResultsPageClient />;
}
