import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/page-metadata';
import LenderJoinPageClient from './LenderJoinPageClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Lender Join',
  description: 'Apply to join the Auto Loan Pro lender network and access qualified auto loan applicants with pay-per-funded-deal pricing.',
  path: '/lender/join',
});

export default function LenderJoinPage() {
  return <LenderJoinPageClient />;
}
