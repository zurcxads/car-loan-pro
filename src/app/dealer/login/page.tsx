"use client";

import { Suspense } from 'react';
import PortalLoginCard from '@/components/auth/PortalLoginCard';

export default function DealerLoginPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginCard role="dealer" heading="Dealer Portal" destination="/dealer" />
    </Suspense>
  );
}
