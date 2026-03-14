import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Account Login',
    description: 'Sign in to your Auto Loan Pro account to continue your application or manage your portal access.',
    path: '/auth/login',
    noIndex: true,
  });
}
