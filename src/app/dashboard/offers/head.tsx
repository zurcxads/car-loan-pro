import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Loan Offers',
    description: 'Review and compare the loan offers available in your Auto Loan Pro dashboard.',
    path: '/dashboard/offers',
    noIndex: true,
  });
}
