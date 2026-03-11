"use client";

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOCK_LENDERS, MOCK_DEALERS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import KPICard from '@/components/shared/KPICard';

const monthlyRevenue = [
  { month: 'Oct', referral: 12600, subscriptions: 2296, total: 14896 },
  { month: 'Nov', referral: 15300, subscriptions: 2296, total: 17596 },
  { month: 'Dec', referral: 11400, subscriptions: 2296, total: 13696 },
  { month: 'Jan', referral: 16500, subscriptions: 2296, total: 18796 },
  { month: 'Feb', referral: 18900, subscriptions: 2296, total: 21196 },
  { month: 'Mar', referral: 8400, subscriptions: 2296, total: 10696 },
];

const tooltipStyle = {
  contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '12px' },
};

export default function RevenueBilling() {
  const [range, setRange] = useState('month');

  const totalReferral = MOCK_LENDERS.reduce((s, l) => s + l.totalReferralFeesOwed, 0);
  const totalSubscription = MOCK_DEALERS.reduce((s, d) => s + d.planPrice, 0);
  const mrr = totalSubscription;
  const totalRevenue = totalReferral + totalSubscription;
  const ytdRevenue = monthlyRevenue.reduce((s, m) => s + m.total, 0);

  const exportCSV = () => {
    const headers = ['Month', 'Referral Fees', 'Subscriptions', 'Total'];
    const rows = monthlyRevenue.map(m => [m.month, m.referral.toString(), m.subscriptions.toString(), m.total.toString()]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
          {[['month', 'This Month'], ['lastMonth', 'Last Month'], ['90', 'Last 90 Days'], ['ytd', 'YTD']].map(([key, label]) => (
            <button key={key} onClick={() => setRange(key)} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${range === key ? 'bg-white border border-gray-200 shadow-sm text-gray-900' : 'text-gray-500'}`}>{label}</button>
          ))}
        </div>
        <button onClick={exportCSV} className="px-4 py-2 text-xs border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer">Export CSV</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KPICard label="Referral Fees" value={formatCurrency(totalReferral)} delay={0} />
        <KPICard label="Subscriptions" value={formatCurrency(totalSubscription)} delay={0.05} />
        <KPICard label="Total Revenue" value={formatCurrency(totalRevenue)} delay={0.1} />
        <KPICard label="MRR" value={formatCurrency(mrr)} delay={0.15} />
        <KPICard label="YTD Revenue" value={formatCurrency(ytdRevenue)} delay={0.2} />
        <KPICard label="Projected Annual" value={formatCurrency(ytdRevenue * 2)} delay={0.25} />
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-semibold mb-6">Monthly Revenue Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="referral" fill="#3B82F6" name="Referral Fees" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="subscriptions" fill="#22C55E" name="Subscriptions" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Fees */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200"><h3 className="text-sm font-semibold">Referral Fees by Lender</h3></div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Lender', 'Funded', 'Fee Rate', 'Fees Earned', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_LENDERS.map(l => (
                <tr key={l.id} className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">{l.name}</td>
                  <td className="py-3 px-4 text-gray-500">{Math.round(l.totalFundedVolume / 30000)}</td>
                  <td className="py-3 px-4 text-gray-500">${l.referralFee}</td>
                  <td className="py-3 px-4 text-green-600 font-semibold">{formatCurrency(l.totalReferralFeesOwed)}</td>
                  <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dealer Subscriptions */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200"><h3 className="text-sm font-semibold">Dealer Subscriptions</h3></div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Dealer', 'Plan', 'Monthly', 'Billing', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_DEALERS.map(d => (
                <tr key={d.id} className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">{d.name}</td>
                  <td className="py-3 px-4 text-gray-700">{d.plan}</td>
                  <td className="py-3 px-4">${d.planPrice}</td>
                  <td className="py-3 px-4 text-gray-500">{d.billingDate}</td>
                  <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
