import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Borrower Dashboard',
    description: 'Track your application, offers, and next steps from the Auto Loan Pro borrower dashboard.',
    path: '/dashboard',
    noIndex: true,
  });
}
