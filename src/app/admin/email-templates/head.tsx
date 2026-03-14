import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Admin Email Templates',
    description: 'Manage transactional and lifecycle email templates used across Auto Loan Pro.',
    path: '/admin/email-templates',
    noIndex: true,
  });
}
