"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function ResetPasswordPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is invalid or expired.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || payload.success !== true) {
        setError(payload.error ?? 'Unable to reset password.');
        return;
      }

      setSuccess(true);
      window.setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      setError('Unable to reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center bg-[#F6F9FC] px-6 py-10 text-[#0A2540]">
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[28px] border border-[#E3E8EE] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#0A2540]">Choose a new password</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Set a new password for your consumer dashboard.
            </p>
          </div>

          {success ? (
            <div className="mt-8 rounded-[24px] border border-[#E3E8EE] bg-[#F6F9FC] p-6 text-sm text-slate-700">
              Password updated! Redirecting to login...
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="reset-password" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  New password
                </label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  className="w-full rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="reset-password-confirm" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Confirm password
                </label>
                <input
                  id="reset-password-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
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
                {submitting ? 'Updating password...' : 'Update Password'}
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
