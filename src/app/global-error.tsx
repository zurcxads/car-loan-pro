"use client";

import './globals.css';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global runtime error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center shadow-2xl animate-fade-in-up">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 4h.01M5.636 5.636a9 9 0 1112.728 12.728A9 9 0 015.636 5.636z" />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-semibold">Critical Application Error</h1>
            <p className="mx-auto mb-8 max-w-lg text-sm text-zinc-400">
              Auto Loan Pro hit an unrecoverable problem. Retry the request or return to the homepage.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={reset}
                className="inline-flex min-w-40 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex min-w-40 items-center justify-center rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800"
              >
                Go Home
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-8 overflow-x-auto rounded-2xl bg-black/40 p-4 text-left text-xs text-red-300">
                {error.message}
              </pre>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
