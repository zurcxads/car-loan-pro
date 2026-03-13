"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect /auth/login to /login
 * Maintain backward compatibility with old auth flow
 */
export default function AuthLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
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
