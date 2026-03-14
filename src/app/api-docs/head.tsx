import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'API Documentation',
    description: 'Explore Auto Loan Pro API endpoints, request formats, and integration examples.',
    path: '/api-docs',
  });
}
