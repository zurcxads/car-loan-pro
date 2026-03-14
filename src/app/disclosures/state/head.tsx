import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'State Disclosures',
    description: 'Review state-specific consumer lending disclosures provided by Auto Loan Pro.',
    path: '/disclosures/state',
  });
}
