import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Lender Partner Registration',
    description: 'Apply to join the Auto Loan Pro lender network and connect with qualified borrowers.',
    path: '/lender/onboard',
    noIndex: true,
  });
}
