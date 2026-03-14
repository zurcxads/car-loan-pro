import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Admin Settings',
    description: 'Configure operational settings, workflows, and controls for Auto Loan Pro.',
    path: '/admin/settings',
    noIndex: true,
  });
}
