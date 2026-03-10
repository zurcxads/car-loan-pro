"use client";

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(errorParam === 'unauthorized' ? 'You do not have access to that page.' : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const quickLogin = async (email: string, pass: string) => {
    setLoading(true);
    const result = await signIn('credentials', { email, password: pass, redirect: false });
    if (!result?.error) {
      const redirectMap: Record<string, string> = {
        'lender@demo.com': '/lender',
        'dealer@demo.com': '/dealer',
        'admin@carloanpro.com': '/admin',
        'marcus.j@email.com': '/status',
      };
      router.push(redirectMap[email] || '/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="rounded-2xl surface p-8">
          <Link href="/" className="text-lg font-semibold tracking-tight block mb-8">Car Loan Pro</Link>
          <h2 className="text-lg font-semibold mb-1">Sign In</h2>
          <p className="text-xs text-zinc-500 mb-6">Access your portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Quick login buttons */}
        <div className="mt-6 space-y-2">
          <p className="text-[10px] text-zinc-600 text-center mb-3 uppercase tracking-wider">Demo Quick Login</p>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => quickLogin('marcus.j@email.com', 'demo123')} disabled={loading}
              className="py-2.5 text-[10px] font-medium border border-white/10 hover:border-green-600/30 hover:bg-green-600/5 rounded-lg transition-colors duration-200 cursor-pointer text-zinc-400 hover:text-green-400">
              Consumer
            </button>
            <button onClick={() => quickLogin('lender@demo.com', 'demo123')} disabled={loading}
              className="py-2.5 text-[10px] font-medium border border-white/10 hover:border-blue-600/30 hover:bg-blue-600/5 rounded-lg transition-colors duration-200 cursor-pointer text-zinc-400 hover:text-blue-400">
              Lender
            </button>
            <button onClick={() => quickLogin('dealer@demo.com', 'demo123')} disabled={loading}
              className="py-2.5 text-[10px] font-medium border border-white/10 hover:border-blue-600/30 hover:bg-blue-600/5 rounded-lg transition-colors duration-200 cursor-pointer text-zinc-400 hover:text-blue-400">
              Dealer
            </button>
            <button onClick={() => quickLogin('admin@carloanpro.com', 'admin2026')} disabled={loading}
              className="py-2.5 text-[10px] font-medium border border-white/10 hover:border-red-600/30 hover:bg-red-600/5 rounded-lg transition-colors duration-200 cursor-pointer text-zinc-400 hover:text-red-400">
              Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
