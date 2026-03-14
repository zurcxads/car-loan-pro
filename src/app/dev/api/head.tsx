import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Developer API Tools',
    description: 'Internal API testing and developer tools for Auto Loan Pro.',
    path: '/dev/api',
    noIndex: true,
  });
}
