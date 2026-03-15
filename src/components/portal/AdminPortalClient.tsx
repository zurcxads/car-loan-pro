"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PortalLayout from '@/components/shared/PortalLayout';
import PlatformOverview from '@/components/admin/PlatformOverview';
import ApplicationManagement from '@/components/admin/ApplicationManagement';
import LenderManagement from '@/components/admin/LenderManagement';
import DealerManagement from '@/components/admin/DealerManagement';
import ComplianceCenter from '@/components/admin/ComplianceCenter';
import RevenueBilling from '@/components/admin/RevenueBilling';
import SystemSettings from '@/components/admin/SystemSettings';
import type { PartnerApplicationListItem } from '@/lib/partner-applications';
import { createClient } from '@/lib/supabase/client';

type Tab = 'overview' | 'applications' | 'lenders' | 'dealers' | 'compliance' | 'revenue' | 'system';

const navItems = [
  { key: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { key: 'applications', label: 'Applications', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { key: 'partner-applications', label: 'Partner Applications', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg> },
  { key: 'lenders', label: 'Lenders', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { key: 'dealers', label: 'Dealers', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { key: 'compliance', label: 'Compliance', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
  { key: 'revenue', label: 'Revenue', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { key: 'system', label: 'System', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

export interface PortalUser {
  name?: string | null;
  email?: string | null;
  entityId?: string | null;
}

type AdminPortalClientProps = {
  pendingApplications?: PartnerApplicationListItem[];
  user: PortalUser;
};

type PendingAction = {
  action: 'approve' | 'reject';
  applicationId: string;
} | null;

function PendingApplicationsSection({
  applications,
  onApprove,
  onReject,
  pendingAction,
}: {
  applications: PartnerApplicationListItem[];
  onApprove: (application: PartnerApplicationListItem) => void;
  onReject: (application: PartnerApplicationListItem) => void;
  pendingAction: PendingAction;
}) {
  return (
    <section className="mb-6 rounded-3xl border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Pending Applications</p>
          <h2 className="text-2xl font-semibold text-[#0A2540]">Lender and dealer join requests</h2>
        </div>
        <div className="rounded-full bg-[#F6F9FC] px-3 py-1 text-sm font-semibold text-[#425466]">
          {applications.length} pending
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D7E3F1] bg-[#F6F9FC] px-4 py-8 text-center text-sm text-[#6B7C93]">
          No pending lender or dealer applications.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E3E8EE]">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#6B7C93]">
                <th className="py-3 pr-4">Company</th>
                <th className="py-3 pr-4">Contact Email</th>
                <th className="py-3 pr-4">Submitted</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE] text-sm text-[#425466]">
              {applications.map((application) => {
                const approvePending = pendingAction?.action === 'approve' && pendingAction.applicationId === application.id;
                const rejectPending = pendingAction?.action === 'reject' && pendingAction.applicationId === application.id;

                return (
                  <tr key={application.id}>
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-[#0A2540]">{application.companyName}</div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-[#6B7C93]">{application.type}</div>
                    </td>
                    <td className="py-4 pr-4">{application.email}</td>
                    <td className="py-4 pr-4">
                      {new Date(application.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => onApprove(application)}
                          disabled={Boolean(pendingAction)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                          {approvePending ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(application)}
                          disabled={Boolean(pendingAction)}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
                        >
                          {rejectPending ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminPortalClient({ pendingApplications = [], user }: AdminPortalClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [applications, setApplications] = useState<PartnerApplicationListItem[]>(pendingApplications);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const tabLabels: Record<Tab, string> = {
    overview: 'Platform Overview',
    applications: 'Application Management',
    lenders: 'Lender Management',
    dealers: 'Dealer Management',
    compliance: 'Compliance Center',
    revenue: 'Revenue & Billing',
    system: 'System Settings',
  };

  const submitPartnerDecision = async (
    action: 'approve' | 'reject',
    application: PartnerApplicationListItem,
  ) => {
    setPendingAction({ action, applicationId: application.id });

    try {
      const response = await fetch(`/api/admin/partners/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: application.type,
          applicationId: application.id,
        }),
      });

      const payload = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !payload.success) {
        toast.error(payload.error || 'Unable to update application.');
        return;
      }

      setApplications((currentApplications) => currentApplications.filter((item) => item.id !== application.id));
      toast.success(action === 'approve' ? 'Application approved.' : 'Application rejected.');
    } catch {
      toast.error('Unable to update application.');
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <PortalLayout
      portalName={tabLabels[tab]}
      portalBadge="Admin"
      badgeColor="red"
      navItems={navItems}
      activeTab={tab}
      onTabChange={(t) => {
        if (t === 'partner-applications') {
          router.push('/admin/applications');
          return;
        }
        setTab(t as Tab);
      }}
      onLogout={async () => {
        try {
          await createClient().auth.signOut();
        } catch {
          // Ignore logout errors in local preview mode.
        }
        router.push('/');
      }}
      userName={user.name || user.email || 'Admin'}
    >
      <div className="animate-fadeIn">
        {tab === 'overview' && (
          <>
            <PendingApplicationsSection
              applications={applications}
              onApprove={(application) => void submitPartnerDecision('approve', application)}
              onReject={(application) => void submitPartnerDecision('reject', application)}
              pendingAction={pendingAction}
            />
            <PlatformOverview />
          </>
        )}
        {tab === 'applications' && <ApplicationManagement />}
        {tab === 'lenders' && <LenderManagement />}
        {tab === 'dealers' && <DealerManagement />}
        {tab === 'compliance' && <ComplianceCenter />}
        {tab === 'revenue' && <RevenueBilling />}
        {tab === 'system' && <SystemSettings />}
      </div>
    </PortalLayout>
  );
}
