import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'ECOA Disclosure',
    description: 'Review Equal Credit Opportunity Act disclosures and borrower rights from Auto Loan Pro.',
    path: '/disclosures/ecoa',
  });
}
