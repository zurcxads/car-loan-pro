import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Advertising Disclosures',
    description: 'Read Auto Loan Pro advertising disclosures and marketing transparency notices.',
    path: '/disclosures/advertising',
  });
}
