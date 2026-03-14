"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import KPICard from '@/components/shared/KPICard';
import { isDev as isDevEnvironment } from '@/lib/env';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';

interface BuyerRecord {
  application: { id: string };
}

interface DealRecord {
  amount?: number;
  status?: string;
}

export default function DealerDashboard({ dealerId }: { dealerId: string | null }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [buyers, setBuyers] = useState<BuyerRecord[]>([]);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');

      try {
        if (!dealerId) {
          setBuyers([]);
          setDeals([]);
          return;
        }

        const [buyersRes, dealsRes] = await Promise.all([
          fetch(`/api/dealers/${dealerId}/buyers`, { cache: 'no-store' }),
          fetch(`/api/dealers/${dealerId}/deals`, { cache: 'no-store' }),
        ]);

        if (!buyersRes.ok || !dealsRes.ok) {
          throw new Error('Failed to load dealer dashboard');
        }

        const [buyersJson, dealsJson] = await Promise.all([buyersRes.json(), dealsRes.json()]);
        setBuyers(buyersJson.data?.buyers || []);
        setDeals(dealsJson.data?.deals || []);
      } catch (fetchError) {
        const isDevMode = isDevEnvironment();
        if (!isDevMode) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dealer dashboard');
        } else {
          setBuyers(MOCK_APPLICATIONS.filter((app) => app.status === 'offers_available' || app.status === 'conditional').map((application) => ({ application })));
          setDeals([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [dealerId]);

  const activeShoppersInArea = buyers.length;
  const leadsToday = buyers.length;
  const conversionsThisWeek = deals.filter((deal) => deal.status === 'funded').length;
  const avgDealSize = deals.length ? Math.round(deals.reduce((sum, deal) => sum + Number(deal.amount || 0), 0) / deals.length) : 0;
  const monthlyFunded = deals.filter((deal) => deal.status === 'funded').length;
  const monthlyRevenue = deals.filter((deal) => deal.status === 'funded').reduce((sum, deal) => sum + Number(deal.amount || 0), 0);

  if (loading) {
    return <div className="py-12 text-sm text-gray-500 dark:text-zinc-400">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2">Dealer dashboard unavailable</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">{error}</p>
      </div>
    );
  }

  if (buyers.length === 0 && deals.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2">No dealer activity yet</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Selected consumers and funded deals will appear here once real data exists in Supabase.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-1">Good morning</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400">{today}</p>
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {buyers.slice(0, 3).map((buyer) => (
              <div key={buyer.application.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-zinc-100">New pre-approved buyer available</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">Application {buyer.application.id}</p>
                </div>
              </div>
            ))}
            {deals.slice(0, 1).map((deal, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-zinc-100">Deal activity</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{deal.status || 'submitted'} {deal.amount ? `• $${Number(deal.amount).toLocaleString()}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              View All Pre-Approved Shoppers
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              Manage Leads
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl transition-colors text-sm font-medium cursor-pointer">
              View Performance
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
