import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Dashboard Settings',
    description: 'Manage borrower account settings and preferences in Auto Loan Pro.',
    path: '/dashboard/settings',
    noIndex: true,
  });
}
