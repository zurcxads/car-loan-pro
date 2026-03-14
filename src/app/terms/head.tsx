import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Terms of Service',
    description: 'Review the Auto Loan Pro terms of service, platform rules, and legal conditions.',
    path: '/terms',
  });
}
