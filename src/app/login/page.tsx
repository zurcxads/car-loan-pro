"use client";

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function LoginForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (errorParam === 'invalid_token') {
      toast.error('Invalid magic link. Please request a new one.');
    } else if (errorParam === 'expired_token') {
      toast.error('This link has expired. Please request a new one.');
    } else if (errorParam === 'verification_failed') {
      toast.error('Verification failed. Please try again.');
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, we'd look up the application ID by email
      // For now, we'll show a message that the link will be sent
      // The actual implementation would call /api/auth/magic-link/send

      // Mock: simulate sending magic link
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSent(true);
      toast.success('Check your email for a login link!');
    } catch {
      toast.error('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 block mb-8">Auto Loan Pro</Link>

          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Access Your Dashboard</h2>
                <p className="text-xs text-gray-500 mb-6">Enter your email and we&apos;ll send you a secure login link. No password needed.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending link...
                      </span>
                    ) : (
                      'Send Me a Link'
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    First time here?{' '}
                    <Link href="/apply" className="text-blue-600 hover:text-blue-500 font-medium">Apply for pre-approval</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-sm text-gray-500 mb-6">
                  We sent a login link to <strong>{email}</strong>. Click the link in the email to access your dashboard.
                </p>
                <p className="text-xs text-gray-400 mb-4">The link expires in 24 hours.</p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Send to a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-1">Passwordless & Secure</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We use magic links instead of passwords. It&apos;s faster, more secure, and one less password to remember.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
