"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /auth/register to /apply
 * The application IS the registration for consumers
 */
export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/apply');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
