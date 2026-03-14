import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Consumer Disclosures',
    description: 'Review important lending, advertising, and regulatory disclosures for Auto Loan Pro.',
    path: '/disclosures',
  });
}
