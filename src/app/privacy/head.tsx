import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Privacy Policy',
    description: 'Read the full Auto Loan Pro privacy policy covering data collection, usage, sharing, and retention.',
    path: '/privacy',
  });
}
