import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Loan Results',
    description: 'Compare your matched auto loan offers and explore next steps in Auto Loan Pro.',
    path: '/results',
    noIndex: true,
  });
}
