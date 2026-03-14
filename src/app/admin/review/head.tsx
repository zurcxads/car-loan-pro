import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Admin Application Review',
    description: 'Review submitted applications and marketplace decisions in the Auto Loan Pro admin portal.',
    path: '/admin/review',
    noIndex: true,
  });
}
