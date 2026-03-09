"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PortalLayout from '@/components/shared/PortalLayout';
import PlatformOverview from '@/components/admin/PlatformOverview';
import ApplicationManagement from '@/components/admin/ApplicationManagement';
import LenderManagement from '@/components/admin/LenderManagement';
import DealerManagement from '@/components/admin/DealerManagement';
import ComplianceCenter from '@/components/admin/ComplianceCenter';
import RevenueBilling from '@/components/admin/RevenueBilling';
import SystemSettings from '@/components/admin/SystemSettings';

type Tab = 'overview' | 'applications' | 'lenders' | 'dealers' | 'compliance' | 'revenue' | 'system';

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const login = (e: React.FormEvent) => { e.preventDefault(); if (user === 'admin@clp' && pass === 'admin2026') onAuth(); else setError('Invalid credentials. Use admin@clp / admin2026'); };
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl surface p-8">
        <Link href="/" className="text-lg font-semibold tracking-tight block mb-8">Car Loan Pro</Link>
        <h2 className="text-lg font-semibold mb-1">Admin Panel</h2>
        <p className="text-xs text-zinc-500 mb-6">Restricted access</p>
        <form onSubmit={login} className="space-y-4">
          <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="Username" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">Sign In</button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-4 text-center">Demo: admin@clp / admin2026</p>
      </motion.div>
    </div>
  );
}

const navItems = [
  { key: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { key: 'applications', label: 'Applications', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'lenders', label: 'Lenders', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { key: 'dealers', label: 'Dealers', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { key: 'compliance', label: 'Compliance', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { key: 'revenue', label: 'Revenue', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { key: 'system', label: 'System', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const tabLabels: Record<Tab, string> = {
    overview: 'Platform Overview',
    applications: 'Application Management',
    lenders: 'Lender Management',
    dealers: 'Dealer Management',
    compliance: 'Compliance Center',
    revenue: 'Revenue & Billing',
    system: 'System Settings',
  };

  return (
    <PortalLayout
      portalName={tabLabels[tab]}
      portalBadge="Admin"
      badgeColor="red"
      navItems={navItems}
      activeTab={tab}
      onTabChange={(t) => setTab(t as Tab)}
      onLogout={() => setAuthed(false)}
      userName="admin@clp"
      sidebarDark
    >
      {tab === 'overview' && <PlatformOverview />}
      {tab === 'applications' && <ApplicationManagement />}
      {tab === 'lenders' && <LenderManagement />}
      {tab === 'dealers' && <DealerManagement />}
      {tab === 'compliance' && <ComplianceCenter />}
      {tab === 'revenue' && <RevenueBilling />}
      {tab === 'system' && <SystemSettings />}
    </PortalLayout>
  );
}
