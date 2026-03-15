"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminRouteShell from '@/components/admin/AdminRouteShell';
import PartnerApplicationStatusBadge from '@/components/admin/PartnerApplicationStatusBadge';
import type { PartnerApplicationListItem, PartnerApplicationType } from '@/lib/partner-applications';

type ApiResponse = {
  data?: {
    applications?: PartnerApplicationListItem[];
  };
  error?: string;
  success?: boolean;
};

const tabs: { label: string; type: PartnerApplicationType }[] = [
  { label: 'Lender Applications', type: 'lender' },
  { label: 'Dealer Applications', type: 'dealer' },
];

function formatSubmittedDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function PartnerApplicationsPageClient({
  userLabel,
}: {
  userLabel?: string;
}) {
  const [activeTab, setActiveTab] = useState<PartnerApplicationType>('lender');
  const [applications, setApplications] = useState<PartnerApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/admin/partner-applications?status=pending', {
          credentials: 'same-origin',
        });
        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || payload.success !== true || !payload.data?.applications) {
          throw new Error(payload.error || 'Unable to load applications.');
        }

        if (!cancelled) {
          setApplications(payload.data.applications);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load applications.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredApplications = applications.filter((application) => application.type === activeTab);

  return (
    <AdminRouteShell
      title="Partner Applications"
      subtitle="Review lender and dealer join requests before granting portal access."
      userLabel={userLabel}
    >
      <div className="rounded-[28px] border border-[#E3E8EE] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#E3E8EE] px-6 pt-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setActiveTab(tab.type)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.type
                    ? 'bg-[#0A2540] text-white'
                    : 'bg-[#F6F9FC] text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-4 pb-6 text-sm text-slate-500">
            Pending applications only. Review to create portal access or reject the request.
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center px-6 py-20 text-sm text-slate-500">
            Loading applications...
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-10">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-20 text-center text-sm text-slate-500">
            No pending applications in this queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E3E8EE]">
              <thead className="bg-[#F6F9FC]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Company/Dealership Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Submitted Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EE]">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 text-sm font-medium text-[#0A2540]">{application.companyName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{application.contactName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{application.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatSubmittedDate(application.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <PartnerApplicationStatusBadge status={application.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/applications/${application.id}`}
                        className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminRouteShell>
  );
}
