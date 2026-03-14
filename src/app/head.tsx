import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Auto Loan Pro - Auto Lending Marketplace',
    description: 'Get pre-approved for an auto loan from multiple lenders with one secure application and no dealer markup.',
    path: '/',
  });
}
