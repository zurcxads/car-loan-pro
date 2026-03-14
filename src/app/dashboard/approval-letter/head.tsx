import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Approval Letter',
    description: 'View and download your Auto Loan Pro pre-approval letter.',
    path: '/dashboard/approval-letter',
    noIndex: true,
  });
}
