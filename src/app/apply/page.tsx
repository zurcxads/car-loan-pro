import type { Metadata } from 'next';
import ApplyPageClient from './ApplyPageClient';

const title = 'Apply for Pre-Approval — Auto Loan Pro';
const description = 'Complete one secure application to get matched with auto lenders and receive pre-approval offers in minutes.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
};

export default function ApplyPage() {
  return <ApplyPageClient />;
}
