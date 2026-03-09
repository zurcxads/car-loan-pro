"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { type MockApplication } from '@/lib/mock-data';
import PortalLayout from '@/components/shared/PortalLayout';
import BuyerInbox from '@/components/dealer/BuyerInbox';
import DealFinalization from '@/components/dealer/DealFinalization';
import ActiveDeals from '@/components/dealer/ActiveDeals';
import PerformanceDashboard from '@/components/dealer/PerformanceDashboard';
import DealerSettings from '@/components/dealer/DealerSettings';

type Tab = 'inbox' | 'finalize' | 'deals' | 'performance' | 'settings';

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = (e: React.FormEvent) => { e.preventDefault(); if (email === 'dealer@demo.com' && password === 'demo123') onAuth(); else setError('Invalid credentials. Use dealer@demo.com / demo123'); };
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl surface p-8">
        <Link href="/" className="text-lg font-semibold tracking-tight block mb-8">Car Loan Pro</Link>
        <h2 className="text-lg font-semibold mb-1">Dealer Portal</h2>
        <p className="text-xs text-zinc-500 mb-6">Access pre-approved buyers</p>
        <form onSubmit={login} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">Sign In</button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-4 text-center">Demo: dealer@demo.com / demo123</p>
      </motion.div>
    </div>
  );
}

const navItems = [
  { key: 'inbox', label: 'Pre-Approved Buyers', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { key: 'finalize', label: 'Deal Finalization', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'deals', label: 'Active Deals', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { key: 'performance', label: 'Performance', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { key: 'settings', label: 'Settings', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export default function DealerPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('inbox');
  const [selectedBuyer, setSelectedBuyer] = useState<MockApplication | null>(null);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const handleStartDeal = (app: MockApplication) => {
    setSelectedBuyer(app);
    setTab('finalize');
  };

  const tabLabels: Record<Tab, string> = {
    inbox: 'Pre-Approved Buyers',
    finalize: 'Deal Finalization',
    deals: 'Active Deals',
    performance: 'Performance',
    settings: 'Settings',
  };

  return (
    <PortalLayout
      portalName={tabLabels[tab]}
      portalBadge="Dealer"
      badgeColor="blue"
      navItems={navItems}
      activeTab={tab}
      onTabChange={(t) => setTab(t as Tab)}
      onLogout={() => setAuthed(false)}
      userName="AutoMax Houston"
    >
      {tab === 'inbox' && <BuyerInbox onStartDeal={handleStartDeal} />}
      {tab === 'finalize' && <DealFinalization selectedBuyer={selectedBuyer} />}
      {tab === 'deals' && <ActiveDeals />}
      {tab === 'performance' && <PerformanceDashboard />}
      {tab === 'settings' && <DealerSettings />}
    </PortalLayout>
  );
}
