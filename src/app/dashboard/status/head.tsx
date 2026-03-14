import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Application Status',
    description: 'Check the latest status of your Auto Loan Pro application.',
    path: '/dashboard/status',
    noIndex: true,
  });
}
