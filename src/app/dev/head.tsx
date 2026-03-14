import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Developer Sandbox',
    description: 'Developer tools and preview utilities for Auto Loan Pro.',
    path: '/dev',
    noIndex: true,
  });
}
