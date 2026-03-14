import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Sign In',
    description: 'Sign in to Auto Loan Pro to continue your application, review offers, or access your portal.',
    path: '/login',
    noIndex: true,
  });
}
