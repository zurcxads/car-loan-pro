"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PortalLayout from '@/components/shared/PortalLayout';
import ApplicationQueue from '@/components/lender/ApplicationQueue';
import UnderwritingRules from '@/components/lender/UnderwritingRules';
import Pipeline from '@/components/lender/Pipeline';
import Reporting from '@/components/lender/Reporting';

type Tab = 'applications' | 'underwriting' | 'pipeline' | 'reporting';

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = (e: React.FormEvent) => { e.preventDefault(); if (email === 'lender@demo.com' && password === 'demo123') onAuth(); else setError('Invalid credentials. Use lender@demo.com / demo123'); };
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl surface p-8">
        <Link href="/" className="text-lg font-semibold tracking-tight block mb-8">Car Loan Pro</Link>
        <h2 className="text-lg font-semibold mb-1">Lender Portal</h2>
        <p className="text-xs text-zinc-500 mb-6">Sign in to manage applications</p>
        <form onSubmit={login} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">Sign In</button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-4 text-center">Demo: lender@demo.com / demo123</p>
      </motion.div>
    </div>
  );
}

const navItems = [
  { key: 'applications', label: 'Applications', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'underwriting', label: 'Underwriting Rules', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
  { key: 'pipeline', label: 'Pipeline', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
  { key: 'reporting', label: 'Reporting', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

export default function LenderPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('applications');

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return (
    <PortalLayout
      portalName={tab === 'applications' ? 'Application Queue' : tab === 'underwriting' ? 'Underwriting Rules' : tab === 'pipeline' ? 'Pipeline' : 'Reporting'}
      portalBadge="Lender"
      badgeColor="blue"
      navItems={navItems}
      activeTab={tab}
      onTabChange={(t) => setTab(t as Tab)}
      onLogout={() => setAuthed(false)}
      userName="lender@demo.com"
    >
      {tab === 'applications' && <ApplicationQueue />}
      {tab === 'underwriting' && <UnderwritingRules />}
      {tab === 'pipeline' && <Pipeline />}
      {tab === 'reporting' && <Reporting />}
    </PortalLayout>
  );
}
