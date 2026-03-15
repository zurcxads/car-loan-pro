import type { Metadata } from 'next';
import ForgotPasswordPageClient from './ForgotPasswordPageClient';
import { createPageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Reset Password — Auto Loan Pro',
  description: 'Request a secure password reset link for your Auto Loan Pro dashboard.',
  path: '/forgot-password',
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />;
}
