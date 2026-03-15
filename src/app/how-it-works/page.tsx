import type { Metadata } from 'next';
import HowItWorksPageClient from './HowItWorksPageClient';

const title = 'How It Works — Auto Loan Pro';
const description = 'See how Auto Loan Pro matches borrowers with lenders, compares offers side by side, and helps you shop with a clearer financing plan.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
};

export default function HowItWorksPage() {
  return <HowItWorksPageClient />;
}
