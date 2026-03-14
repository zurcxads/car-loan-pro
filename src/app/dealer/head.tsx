import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Dealer Portal',
    description: 'Access the Auto Loan Pro dealer portal to review buyers and manage dealership activity.',
    path: '/dealer',
    noIndex: true,
  });
}
