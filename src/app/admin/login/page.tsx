"use client";

import { Suspense } from 'react';
import PortalLoginCard from '@/components/auth/PortalLoginCard';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginCard role="admin" heading="Admin Portal" destination="/admin" />
    </Suspense>
  );
}
