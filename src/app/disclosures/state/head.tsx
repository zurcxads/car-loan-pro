import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'State Disclosures',
    description: 'Review state-specific consumer lending disclosures provided by Auto Loan Pro.',
    path: '/disclosures/state',
  });
}
