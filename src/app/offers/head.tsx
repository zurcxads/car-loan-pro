import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Offers Redirect',
    description: 'Redirecting to your latest Auto Loan Pro offers dashboard.',
    path: '/offers',
    noIndex: true,
  });
}
