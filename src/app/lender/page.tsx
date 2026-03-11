"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { motion } from 'framer-motion';
import PortalLayout from '@/components/shared/PortalLayout';
import ApplicationQueue from '@/components/lender/ApplicationQueue';
import UnderwritingRules from '@/components/lender/UnderwritingRules';
import Pipeline from '@/components/lender/Pipeline';
import Reporting from '@/components/lender/Reporting';

type Tab = 'applications' | 'underwriting' | 'pipeline' | 'reporting';

const navItems = [
  { key: 'applications', label: 'Applications', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'underwriting', label: 'Underwriting Rules', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
  { key: 'pipeline', label: 'Pipeline', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
  { key: 'reporting', label: 'Reporting', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

export default function LenderPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('applications');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/lender');
    return null;
  }

  return (
    <PortalLayout
      portalName={tab === 'applications' ? 'Application Queue' : tab === 'underwriting' ? 'Underwriting Rules' : tab === 'pipeline' ? 'Pipeline' : 'Reporting'}
      portalBadge="Lender"
      badgeColor="blue"
      navItems={navItems}
      activeTab={tab}
      onTabChange={(t) => setTab(t as Tab)}
      onLogout={() => { logout(); router.push('/'); }}
      userName={user?.name || user?.email || 'Lender'}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        {tab === 'applications' && <ApplicationQueue />}
        {tab === 'underwriting' && <UnderwritingRules />}
        {tab === 'pipeline' && <Pipeline />}
        {tab === 'reporting' && <Reporting />}
      </motion.div>
    </PortalLayout>
  );
}
