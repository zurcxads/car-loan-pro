"use client";

import { useEffect, useState } from 'react';
import KPICard from '@/components/shared/KPICard';
import { MOCK_APPLICATIONS, type MockApplication } from '@/lib/mock-data';

export default function DealerDashboard({ dealerId }: { dealerId: string | null }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [applications, setApplications] = useState<MockApplication[]>(MOCK_APPLICATIONS);

  useEffect(() => {
    let mounted = true;

    async function loadApplications() {
      try {
        const response = await fetch('/api/dealers/applications');
        const json = (await response.json()) as { success?: boolean; data?: MockApplication[] };

        if (mounted && json.success && json.data) {
          setApplications(json.data);
        }
      } catch {
      }
    }

    void loadApplications();

    return () => {
      mounted = false;
    };
  }, [dealerId]);

  const activeApplications = applications.filter((application) => application.status === 'offers_available' || application.status === 'conditional');
  const fundedApplications = applications.filter((application) => application.status === 'funded');
  const activeShoppersInArea = activeApplications.length;
  const leadsToday = applications.length;
  const conversionsThisWeek = fundedApplications.length;
  const avgDealSize = fundedApplications.length
    ? Math.round(fundedApplications.reduce((sum, application) => sum + Number(application.loanAmount || 0), 0) / fundedApplications.length)
    : 0;
  const monthlyFunded = fundedApplications.length;
  const monthlyRevenue = fundedApplications.reduce((sum, application) => sum + Number(application.loanAmount || 0), 0);

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">No dealer activity yet</h3>
        <p className="text-sm text-gray-500">Selected consumers and funded deals will appear here once real data exists in Supabase.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-1">Good morning</h2>
        <p className="text-xs text-gray-500">{today}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KPICard label="Leads Today" value={leadsToday.toString()} delta="+1" deltaType="up" delay={0} />
        <KPICard label="Active Shoppers" value={activeShoppersInArea.toString()} delta="+4" deltaType="up" delay={0.05} />
        <KPICard label="Conversions (7d)" value={conversionsThisWeek.toString()} delta="+1" deltaType="up" delay={0.1} />
        <KPICard label="Avg Deal Size" value={avgDealSize ? `$${(avgDealSize / 1000).toFixed(0)}K` : '$0'} delta="+5%" deltaType="up" delay={0.15} />
        <KPICard label="Funded (MTD)" value={monthlyFunded.toString()} delta="+2" deltaType="up" delay={0.2} />
        <KPICard label="Revenue (MTD)" value={monthlyRevenue ? `$${(monthlyRevenue / 1000).toFixed(0)}K` : '$0'} delta="+22%" deltaType="up" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ animationDelay: '0.3s' }} className="animate-fadeIn opacity-0 rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {applications.slice(0, 3).map((application) => (
              <div key={application.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">New pre-approved buyer available</p>
                  <p className="text-xs text-gray-500">Application {application.id}</p>
                </div>
              </div>
            ))}
            {fundedApplications.slice(0, 1).map((application, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">Deal activity</p>
                  <p className="text-xs text-gray-500">{application.status} {application.loanAmount ? `• $${Number(application.loanAmount).toLocaleString()}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ animationDelay: '0.35s' }} className="animate-fadeIn opacity-0 rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              View All Pre-Approved Shoppers
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              Manage Leads
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              View Performance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
