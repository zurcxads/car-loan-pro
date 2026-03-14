import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Developer Component Preview',
    description: 'Preview and inspect Auto Loan Pro UI components in the internal developer workspace.',
    path: '/dev/components',
    noIndex: true,
  });
}
