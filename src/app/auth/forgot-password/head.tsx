import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Forgot Password',
    description: 'Reset your Auto Loan Pro account password securely.',
    path: '/auth/forgot-password',
    noIndex: true,
  });
}
