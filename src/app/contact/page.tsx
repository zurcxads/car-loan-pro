import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

const title = 'Contact Us — Auto Loan Pro';
const description = 'Contact Auto Loan Pro for borrower support, lender partnerships, dealer partnerships, or general platform questions.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
