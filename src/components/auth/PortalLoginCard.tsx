"use client";

import { type FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/shared/Logo';
import { createClient } from '@/lib/supabase/client';

type PortalRole = 'admin' | 'lender' | 'dealer';

type PortalLoginCardProps = {
  role: PortalRole;
  heading: string;
  destination: `/${PortalRole}`;
};

const portalNames: Record<PortalRole, string> = {
  admin: 'admin',
  lender: 'lender',
  dealer: 'dealer',
};

export default function PortalLoginCard({
  role,
  heading,
  destination,
}: PortalLoginCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setErrorMessage('Invalid email or password.');
      setIsSubmitting(false);
      return;
    }

    const userRole = String(data.user.user_metadata?.role || '').toLowerCase();

    if (userRole !== role && !(role !== 'admin' && userRole === 'admin')) {
      await supabase.auth.signOut();
      setErrorMessage(`This account does not have ${portalNames[role]} portal access.`);
      setIsSubmitting(false);
      return;
    }

    const redirectTo = searchParams.get('redirectTo');
    const nextPath = redirectTo?.startsWith(`${destination}/`) ? redirectTo : destination;

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto flex max-w-md flex-col justify-center">
        <div className="rounded-[28px] border border-[#E3E8EE] bg-white p-8 shadow-[0_12px_40px_rgba(10,37,64,0.08)]">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size="md" />
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#0A2540]">
              {heading}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor={`${role}-email`} className="mb-2 block text-sm font-medium text-[#0A2540]">
                Email
              </label>
              <input
                id={`${role}-email`}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-white border border-[#E3E8EE] rounded-xl px-4 py-3.5 text-base text-[#0A2540] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label htmlFor={`${role}-password`} className="mb-2 block text-sm font-medium text-[#0A2540]">
                Password
              </label>
              <input
                id={`${role}-password`}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-white border border-[#E3E8EE] rounded-xl px-4 py-3.5 text-base text-[#0A2540] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            {errorMessage ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-blue-600 px-5 py-3.5 text-base font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
