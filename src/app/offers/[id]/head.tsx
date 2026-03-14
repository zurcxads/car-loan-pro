import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Offer Details',
    description: 'Review the details of your Auto Loan Pro financing offer.',
    path: '/offers/[id]',
    noIndex: true,
  });
}
