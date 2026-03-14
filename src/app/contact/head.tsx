import { createHeadTags } from '@/lib/metadata';

export default function Head() {
  return createHeadTags({
    title: 'Contact Auto Loan Pro',
    description: 'Get in touch with Auto Loan Pro for support, partnership questions, or general inquiries.',
    path: '/contact',
  });
}
