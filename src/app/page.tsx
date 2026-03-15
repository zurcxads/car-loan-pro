import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

const title = 'Auto Loan Pro — Get Pre-Approved in Minutes';
const description = 'Compare auto loan offers from multiple lenders in one marketplace and get pre-approved in minutes with a single secure application.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
