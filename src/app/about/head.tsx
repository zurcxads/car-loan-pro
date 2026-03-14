import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'About Auto Loan Pro',
    description: 'Learn how Auto Loan Pro helps drivers compare lender offers directly and avoid traditional dealership financing friction.',
    path: '/about',
  });
}
