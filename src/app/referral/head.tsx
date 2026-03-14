import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Referral Program',
    description: 'Refer friends to Auto Loan Pro and track referral opportunities and rewards.',
    path: '/referral',
  });
}
