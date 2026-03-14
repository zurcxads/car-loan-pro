import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Apply for Pre-Approval',
    description: 'Complete one secure application to get matched with auto lenders and receive pre-approval options in minutes.',
    path: '/apply',
  });
}
