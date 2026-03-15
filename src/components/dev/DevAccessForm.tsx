"use client";

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DevAccessForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pin, setPin] = useState('');

  const redirectTo = useMemo(() => {
    const value = searchParams.get('redirectTo');
    return value && value.startsWith('/dev') ? value : '/dev';
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/dev/auth', {
        body: JSON.stringify({ pin }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const payload = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok || !payload.success) {
        setError(payload.error || 'Access was not granted.');
        setIsSubmitting(false);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError('Unable to validate access right now.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] px-6 py-20">
      <div className="mx-auto flex min-h-[70vh] max-w-sm items-center">
        <div className="w-full rounded-[28px] border border-[#E3E8EE] bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6B7C93]">
              Internal
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0A2540]">
              Developer Access
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#425466]">
              Enter the developer PIN to access internal testing tools.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="dev-pin" className="mb-2 block text-sm font-medium text-[#0A2540]">
                PIN
              </label>
              <input
                id="dev-pin"
                autoComplete="one-time-code"
                className="w-full rounded-2xl border border-[#D7DFE8] bg-white px-4 py-3.5 text-center text-2xl tracking-[0.35em] text-[#0A2540] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                inputMode="numeric"
                maxLength={6}
                minLength={4}
                onChange={(event) => {
                  const nextPin = event.target.value.replace(/\D/g, '').slice(0, 6);
                  setPin(nextPin);
                }}
                placeholder="2026"
                required
                value={pin}
              />
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || pin.length < 4}
              type="submit"
            >
              {isSubmitting ? 'Validating...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
