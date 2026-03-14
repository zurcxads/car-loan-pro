import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Offers Redirect',
    description: 'Redirecting to your latest Auto Loan Pro offers dashboard.',
    path: '/offers',
    noIndex: true,
  });
}
