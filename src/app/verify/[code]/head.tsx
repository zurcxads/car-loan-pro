import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Verify Contact Information',
    description: 'Securely verify your Auto Loan Pro contact information and continue your application.',
    path: '/verify/[code]',
    noIndex: true,
  });
}
