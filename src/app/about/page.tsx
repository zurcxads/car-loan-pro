import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

const title = 'About — Auto Loan Pro';
const description = 'Learn how Auto Loan Pro helps borrowers compare auto financing options with more transparency before they visit a dealership.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
