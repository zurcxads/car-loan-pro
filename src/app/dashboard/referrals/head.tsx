import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Referral Dashboard',
    description: 'Track referral activity and rewards within your Auto Loan Pro dashboard.',
    path: '/dashboard/referrals',
    noIndex: true,
  });
}
