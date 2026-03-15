import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createPageMetadata } from '@/lib/page-metadata';
import ResetPasswordPageClient from './ResetPasswordPageClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Set New Password — Auto Loan Pro',
  description: 'Set a new password for your Auto Loan Pro dashboard.',
  path: '/reset-password',
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F9FC]" />}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
