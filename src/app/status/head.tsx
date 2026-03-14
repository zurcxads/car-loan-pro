import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Status Redirect',
    description: 'Redirecting to your Auto Loan Pro dashboard status view.',
    path: '/status',
    noIndex: true,
  });
}
