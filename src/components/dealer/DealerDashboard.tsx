"use client";

import { motion } from 'framer-motion';
import KPICard from '@/components/shared/KPICard';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';

export default function DealerDashboard() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const activeShoppersInArea = MOCK_APPLICATIONS.filter(a =>
    (a.status === 'offers_available' || a.status === 'conditional') &&
    a.borrower.city === 'Houston'
  ).length;

  const leadsToday = 3;
  const conversionsThisWeek = 2;
  const avgDealSize = 27500;
  const monthlyFunded = 8;
  const monthlyRevenue = 218000;

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
        <KPICard label="Avg Deal Size" value={`$${(avgDealSize / 1000).toFixed(0)}K`} delta="+5%" deltaType="up" delay={0.15} />
        <KPICard label="Funded (MTD)" value={monthlyFunded.toString()} delta="+2" deltaType="up" delay={0.2} />
        <KPICard label="Revenue (MTD)" value={`$${(monthlyRevenue / 1000).toFixed(0)}K`} delta="+22%" deltaType="up" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">New pre-approved buyer in your area</p>
                <p className="text-xs text-gray-500">Sarah Johnson - $32K approval - 8 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">Deal funded</p>
                <p className="text-xs text-gray-500">Mike Rodriguez - 2019 Honda Accord - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">Approval expiring soon</p>
                <p className="text-xs text-gray-500">Lisa Chen - $28K approval - Expires in 3 days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">Lead contacted</p>
                <p className="text-xs text-gray-500">James Wilson - Marked contacted - 5 hours ago</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View All Pre-Approved Shoppers
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Manage Leads
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Performance
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 mt-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">New pre-approved shoppers available</h3>
            <p className="text-xs text-gray-600 mb-3">
              {activeShoppersInArea} buyers in the Houston area are actively shopping with pre-approval in hand. Reach out now to close more deals.
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer">
              Contact Shoppers
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
