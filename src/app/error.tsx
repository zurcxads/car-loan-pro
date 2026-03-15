"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { captureException } from '@/lib/error-tracking';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { component: 'AppErrorBoundary' });
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center px-6">
      <div className="text-center max-w-2xl animate-fade-in-up">
        {/* Error Illustration */}
        <div className="mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Something Went Wrong
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Please try again, or return to the homepage.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all hover:shadow active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
          </div>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 rounded-xl bg-gray-900 text-left">
              <p className="text-xs font-mono text-red-400 break-all">
                {error.message}
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-12 pt-8 border-t border-gray-200 max-w-md mx-auto">
            <p className="text-sm text-gray-500">
              If this problem persists, please contact us at{' '}
              <a href="mailto:hello@autoloanpro.co" className="text-blue-600 hover:text-blue-700 font-medium">
                hello@autoloanpro.co
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
