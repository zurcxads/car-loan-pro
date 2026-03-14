import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Developer Email Preview',
    description: 'Preview transactional email templates used by Auto Loan Pro.',
    path: '/dev/emails',
    noIndex: true,
  });
}
