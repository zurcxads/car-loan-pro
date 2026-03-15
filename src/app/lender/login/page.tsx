"use client";

import { Suspense } from 'react';
import PortalLoginCard from '@/components/auth/PortalLoginCard';

export default function LenderLoginPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginCard role="lender" heading="Lender Portal" destination="/lender" />
    </Suspense>
  );
}
