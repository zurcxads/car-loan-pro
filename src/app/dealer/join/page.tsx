import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/page-metadata';
import DealerJoinPageClient from './DealerJoinPageClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Dealer Join',
  description: 'Apply to join Auto Loan Pro as a dealer partner and offer buyers instant pre-approval from multiple lenders.',
  path: '/dealer/join',
});

export default function DealerJoinPage() {
  return <DealerJoinPageClient />;
}
