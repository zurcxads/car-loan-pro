import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Admin Analytics',
    description: 'Review marketplace analytics, funding trends, and operational metrics for Auto Loan Pro.',
    path: '/admin/analytics',
    noIndex: true,
  });
}
