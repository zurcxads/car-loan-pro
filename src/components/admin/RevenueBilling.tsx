"use client";

import { useState } from 'react';
import { MOCK_LENDERS, MOCK_DEALERS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import { StackedBarChart, TrendIndicator } from '@/components/shared/charts';

const monthlyRevenue = [
  { month: 'Oct', referral: 12600, subscriptions: 2296, total: 14896 },
  { month: 'Nov', referral: 15300, subscriptions: 2296, total: 17596 },
  { month: 'Dec', referral: 11400, subscriptions: 2296, total: 13696 },
  { month: 'Jan', referral: 16500, subscriptions: 2296, total: 18796 },
  { month: 'Feb', referral: 18900, subscriptions: 2296, total: 21196 },
  { month: 'Mar', referral: 8400, subscriptions: 2296, total: 10696 },
];

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

  const stackedData = monthlyRevenue.map(m => ({
    label: m.month,
    values: [
      { name: 'Referral', value: m.referral, color: '#3B82F6' },
      { name: 'Subscriptions', value: m.subscriptions, color: '#22C55E' }
    ]
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
          {[['month', 'This Month'], ['lastMonth', 'Last Month'], ['90', 'Last 90 Days'], ['ytd', 'YTD']].map(([key, label]) => (
            <button key={key} onClick={() => setRange(key)} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${range === key ? 'bg-white border border-gray-200 shadow-sm text-gray-900' : 'text-gray-500'}`}>{label}</button>
          ))}
        </div>
        <button onClick={exportCSV} className="px-4 py-2.5 text-sm border border-gray-200 hover:border-gray-300 rounded-xl transition-colors cursor-pointer">Export CSV</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Referral Fees', value: formatCurrency(totalReferral), delta: 15.2 },
          { label: 'Subscriptions', value: formatCurrency(totalSubscription), delta: 0 },
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), delta: 12.8 },
          { label: 'MRR', value: formatCurrency(mrr), delta: 0 },
          { label: 'YTD Revenue', value: formatCurrency(ytdRevenue), delta: undefined },
          { label: 'Projected Annual', value: formatCurrency(ytdRevenue * 2), delta: undefined },
        ].map((metric, i) => (
          <div key={i} className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{metric.label}</div>
            {metric.delta !== undefined ? (
              <TrendIndicator value={metric.value} deltaPercent={metric.delta} />
            ) : (
              <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-gray-900">Monthly Revenue Breakdown</h3>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-600" />
              <span className="text-gray-600">Referral Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-600" />
              <span className="text-gray-600">Subscriptions</span>
            </div>
          </div>
        </div>
        <StackedBarChart data={stackedData} height={260} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Fees */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200"><h3 className="text-sm font-semibold text-gray-900">Referral Fees by Lender</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Lender', 'Funded', 'Fee Rate', 'Fees Earned', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_LENDERS.map(l => (
                  <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{l.name}</td>
                    <td className="py-3 px-4 text-gray-600">{Math.round(l.totalFundedVolume / 30000)}</td>
                    <td className="py-3 px-4 text-gray-600">${l.referralFee}</td>
                    <td className="py-3 px-4 text-green-600 font-semibold">{formatCurrency(l.totalReferralFeesOwed)}</td>
                    <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dealer Subscriptions */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200"><h3 className="text-sm font-semibold text-gray-900">Dealer Subscriptions</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Dealer', 'Plan', 'Monthly', 'Billing', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_DEALERS.map(d => (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{d.name}</td>
                    <td className="py-3 px-4 text-gray-700">{d.plan}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">${d.planPrice}</td>
                    <td className="py-3 px-4 text-gray-600">{d.billingDate}</td>
                    <td className="py-3 px-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
