import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Create Account',
    description: 'Create an Auto Loan Pro account to save progress and manage your financing workflow.',
    path: '/auth/register',
    noIndex: true,
  });
}
