"use client";

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { persistToast, useToast } from '@/components/shared/ToastProvider';

type LoginMode = 'magic' | 'password';

const ERROR_MESSAGES: Record<string, string> = {
  expired_token: 'This sign-in link is no longer valid. Request a new one to continue.',
  invalid_token: 'This sign-in link is not valid. Request a new one to continue.',
  session_unavailable: 'We could not complete sign-in. Request a new link to continue.',
  verification_failed: 'We could not complete sign-in. Request a new link to continue.',
};

function LoginCard() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<LoginMode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const urlError = useMemo(() => {
    const error = searchParams.get('error');
    return error ? ERROR_MESSAGES[error] ?? 'We could not complete sign-in. Please try again.' : null;
  }, [searchParams]);

  async function handleMagicLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch('/api/auth/magic-link/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok || payload.success === false) {
        const errorMessage = payload.error ?? 'We could not send a sign-in link. Please try again.';
        setFormError(errorMessage);
        toast({ type: 'error', message: errorMessage });
        return;
      }

      setSent(true);
      toast({ type: 'success', message: 'Secure sign-in link sent to your email.' });
    } catch {
      const errorMessage = 'We could not send a sign-in link. Please try again.';
      setFormError(errorMessage);
      toast({ type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        error?: string;
        redirectTo?: string;
        success?: boolean;
      };

      if (!response.ok || payload.success !== true || !payload.redirectTo) {
        const errorMessage = payload.error ?? 'Invalid credentials';
        setFormError(errorMessage);
        toast({ type: 'error', message: errorMessage });
        return;
      }

      persistToast({ type: 'success', message: 'Signed in successfully.' });
      window.location.href = payload.redirectTo;
    } catch {
      const errorMessage = 'Invalid credentials';
      setFormError(errorMessage);
      toast({ type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center bg-[#F6F9FC] px-6 py-10 text-[#0A2540]">
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[28px] border border-[#E3E8EE] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <Link href="/" className="text-sm font-semibold tracking-[0.16em] text-blue-600 uppercase">
            Auto Loan Pro
          </Link>

          <div className="mt-6">
            <h1 className="text-3xl font-semibold tracking-tight text-[#0A2540]">
              Access your dashboard
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Sign in with a secure email link or use your saved password.
            </p>
          </div>

          <div className="mt-8 flex rounded-full border border-[#E3E8EE] bg-white p-1 shadow-[inset_0_0_0_1px_rgba(227,232,238,0.8)]">
            <button
              type="button"
              onClick={() => {
                setMode('magic');
                setFormError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                mode === 'magic'
                  ? 'bg-white text-[#0A2540] shadow-sm'
                  : 'bg-transparent text-slate-500'
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setSent(false);
                setFormError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                mode === 'password'
                  ? 'bg-white text-[#0A2540] shadow-sm'
                  : 'bg-transparent text-slate-500'
              }`}
            >
              Password
            </button>
          </div>

          {urlError ? (
            <div className="mt-6 rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-3 text-sm text-slate-700">
              {urlError}
            </div>
          ) : null}

          {formError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          {sent && mode === 'magic' ? (
            <div className="mt-6 rounded-[24px] border border-[#E3E8EE] bg-[#F6F9FC] p-6">
              <h2 className="text-lg font-semibold text-[#0A2540]">Check your email</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If an application exists for {email}, a secure sign-in link has been sent.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-5 text-sm font-medium text-blue-600"
              >
                Use a different email
              </button>
            </div>
          ) : mode === 'magic' ? (
            <form className="mt-6 space-y-5" onSubmit={handleMagicLinkSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending link...' : 'Send magic link'}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handlePasswordSubmit}>
              <div>
                <label htmlFor="password-email" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Email address
                </label>
                <input
                  id="password-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#0A2540]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your password"
                />
                <div className="mt-3 text-right">
                  <Link href="/forgot-password" className="text-sm font-medium text-blue-600">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-[#E3E8EE] pt-6 text-center">
            <p className="text-sm leading-6 text-slate-600">
              New here?{' '}
              <Link href="/apply" className="font-medium text-blue-600">
                Apply now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F9FC]" />}>
      <LoginCard />
    </Suspense>
  );
}
