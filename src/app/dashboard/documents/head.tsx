import { createHeadTags } from '@/lib/page-metadata';

export default function Head() {
  return createHeadTags({
    title: 'Document Center',
    description: 'Upload and manage the documents required for your Auto Loan Pro application.',
    path: '/dashboard/documents',
    noIndex: true,
  });
}
