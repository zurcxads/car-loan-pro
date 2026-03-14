"use client";

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PortalLayout from '@/components/shared/PortalLayout';
import DealerDashboard from '@/components/dealer/DealerDashboard';
import BuyerInbox from '@/components/dealer/BuyerInbox';
import LeadManagement from '@/components/dealer/LeadManagement';
import PerformanceDashboard from '@/components/dealer/PerformanceDashboard';
import DealerSettings from '@/components/dealer/DealerSettings';
import type { PortalUser } from './AdminPortalClient';

type Tab = 'dashboard' | 'shoppers' | 'leads' | 'performance' | 'settings';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { key: 'shoppers', label: 'Pre-Approved Shoppers', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { key: 'leads', label: 'Lead Management', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'performance', label: 'Performance', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { key: 'settings', label: 'Settings', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export default function DealerPortalClient({ user }: { user: PortalUser }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('dashboard');

  const tabLabels: Record<Tab, string> = {
    dashboard: 'Dashboard',
    shoppers: 'Pre-Approved Shoppers',
    leads: 'Lead Management',
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
      onLogout={async () => {
        await signOut({ redirect: false });
        router.push('/');
      }}
      userName={user.name || user.email || 'Dealer'}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        {tab === 'dashboard' && <DealerDashboard />}
        {tab === 'shoppers' && <BuyerInbox onStartDeal={() => {}} />}
        {tab === 'leads' && <LeadManagement />}
        {tab === 'performance' && <PerformanceDashboard />}
        {tab === 'settings' && <DealerSettings />}
      </motion.div>
    </PortalLayout>
  );
}
