import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Dealer Partner Registration',
    description: 'Apply to join the Auto Loan Pro dealer partner network and connect with pre-approved buyers.',
    path: '/dealer/onboard',
    noIndex: true,
  });
}
