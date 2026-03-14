import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Lender Portal',
    description: 'Access the Auto Loan Pro lender portal to review applications and manage decisions.',
    path: '/lender',
    noIndex: true,
  });
}
