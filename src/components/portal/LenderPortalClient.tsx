"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/components/shared/PortalLayout';
import ApplicationQueue from '@/components/lender/ApplicationQueue';
import UnderwritingRules from '@/components/lender/UnderwritingRules';
import Pipeline from '@/components/lender/Pipeline';
import Reporting from '@/components/lender/Reporting';
import LenderSettings from '@/components/lender/LenderSettings';
import { createClient } from '@/lib/supabase/client';
import type { PortalUser } from './AdminPortalClient';

type Tab = 'applications' | 'underwriting' | 'pipeline' | 'reporting' | 'settings';

const navItems = [
  { key: 'applications', label: 'Applications', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'underwriting', label: 'Underwriting Rules', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
  { key: 'pipeline', label: 'Pipeline', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
  { key: 'reporting', label: 'Reporting', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
  { key: 'settings', label: 'Settings', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export default function LenderPortalClient({ user }: { user: PortalUser }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('applications');

  const tabLabels: Record<Tab, string> = {
    applications: 'Application Queue',
    underwriting: 'Underwriting Rules',
    pipeline: 'Pipeline',
    reporting: 'Reporting',
    settings: 'Settings',
  };

  return (
    <PortalLayout
      portalName={tabLabels[tab]}
      portalBadge="Lender"
      badgeColor="blue"
      navItems={navItems}
      activeTab={tab}
      onTabChange={(t) => setTab(t as Tab)}
      onLogout={async () => {
        try {
          await createClient().auth.signOut();
        } catch {
          // Ignore logout errors in local preview mode.
        }
        router.push('/');
      }}
      userName={user.name || user.email || 'Lender'}
    >
      <div className="animate-fadeIn">
        {tab === 'applications' && <ApplicationQueue lenderId={user.entityId || null} />}
        {tab === 'underwriting' && <UnderwritingRules />}
        {tab === 'pipeline' && <Pipeline />}
        {tab === 'reporting' && <Reporting />}
        {tab === 'settings' && <LenderSettings />}
      </div>
    </PortalLayout>
  );
}
