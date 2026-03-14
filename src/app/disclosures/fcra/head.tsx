import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'FCRA Disclosure',
    description: 'Understand Fair Credit Reporting Act disclosures, credit inquiry details, and your rights.',
    path: '/disclosures/fcra',
  });
}
