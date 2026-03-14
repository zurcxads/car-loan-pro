import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Referral Dashboard',
    description: 'Track referral activity and rewards within your Auto Loan Pro dashboard.',
    path: '/dashboard/referrals',
    noIndex: true,
  });
}
