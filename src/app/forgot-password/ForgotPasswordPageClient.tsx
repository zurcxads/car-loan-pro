"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json() as { success?: boolean };
      if (!response.ok || payload.success !== true) {
        setError('We could not send a reset link right now. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('We could not send a reset link right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center bg-[#F6F9FC] px-6 py-10 text-[#0A2540]">
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[28px] border border-[#E3E8EE] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0A2540]">Reset your password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Enter the email tied to your application and we&apos;ll send you a secure reset link.
            </p>
          </div>

          {submitted ? (
            <div className="mt-8 rounded-[24px] border border-[#E3E8EE] bg-[#F6F9FC] p-6 text-sm text-slate-700">
              Check your email for a reset link.
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Email address
                </label>
                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending reset link...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-medium text-blue-600">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
