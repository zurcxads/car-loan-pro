import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Admin Email Templates',
    description: 'Manage transactional and lifecycle email templates used across Auto Loan Pro.',
    path: '/admin/email-templates',
    noIndex: true,
  });
}
