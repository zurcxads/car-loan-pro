import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Auto Loan Calculator',
    description: 'Estimate monthly payments, loan costs, and term scenarios with the Auto Loan Pro auto loan calculator.',
    path: '/calculator',
  });
}
