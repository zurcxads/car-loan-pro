import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'How It Works',
    description: 'See how Auto Loan Pro matches you with lenders, compares offers, and helps you shop with confidence.',
    path: '/how-it-works',
  });
}
