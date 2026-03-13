"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/components/shared/PortalLayout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const navItems = [
  { key: 'analytics', label: 'Analytics', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
];

interface AnalyticsData {
  applicationsPerDay: { date: string; count: number }[];
  offersPerLender: { lender: string; count: number }[];
  conversionFunnel: { stage: string; count: number }[];
  approvalRatesByTier: { tier: string; rate: number; total: number }[];
  avgAprTrend: { month: string; avgApr: number | string }[];
}

export default function AnalyticsPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [dateRange, setDateRange] = useState('30');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const isDevMode = typeof window !== 'undefined' && window.location.search.includes('dev=true');

  useEffect(() => {
    if (!isAuthenticated && !isLoading && !isDevMode) {
      router.push('/login?redirect=/admin/analytics');
      return;
    }

    if (isAuthenticated || isDevMode) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, dateRange, router]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${dateRange}`);
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    }
    setLoading(false);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <PortalLayout
      portalName="Analytics Dashboard"
      portalBadge="Admin"
      badgeColor="blue"
      navItems={navItems}
      activeTab="analytics"
      onTabChange={() => {}}
      onLogout={() => { logout(); router.push('/'); }}
      userName={user?.name || 'Admin'}
    >
      <div className="space-y-8">
        {/* Date Range Selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading analytics...</div>
        ) : !data ? (
          <div className="py-16 text-center text-gray-500">No data available</div>
        ) : (
          <>
            {/* Applications Per Day */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Applications Per Day</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.applicationsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} name="Applications" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Offers Per Lender */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Offers Per Lender</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.offersPerLender}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="lender" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#2563eb" name="Offers" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.conversionFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Approval Rates by Credit Tier */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-6">Approval Rates by Credit Tier</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.approvalRatesByTier}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="rate"
                    >
                      {data.approvalRatesByTier.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Average APR Trend */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-6">Average APR Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.avgAprTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgApr" stroke="#f59e0b" strokeWidth={2} name="Avg APR (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
