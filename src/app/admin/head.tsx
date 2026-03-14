import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Admin Dashboard',
    description: 'Manage Auto Loan Pro operations, lender activity, and marketplace performance.',
    path: '/admin',
    noIndex: true,
  });
}
