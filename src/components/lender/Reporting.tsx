"use client";

import { useState } from 'react';
import { BarChart, LineChart, DonutChart, TrendIndicator } from '@/components/shared/charts';

type Range = 'week' | 'month' | 'lastMonth' | 'custom';

const weeklyData = [
  { label: 'W1', value: 18 },
  { label: 'W2', value: 22 },
  { label: 'W3', value: 15 },
  { label: 'W4', value: 25 },
];

const approvalTrend = [
  { label: 'W1', value: 67 },
  { label: 'W2', value: 68 },
  { label: 'W3', value: 67 },
  { label: 'W4', value: 72 },
];

const tierData = [
  { label: 'Prime', value: 42, color: '#22C55E' },
  { label: 'Near-Prime', value: 35, color: '#3B82F6' },
  { label: 'Subprime', value: 23, color: '#F59E0B' },
];

const topVehicles = [
  { vehicle: 'Toyota Camry', count: 8, avgLoan: 26500, avgAPR: 4.89 },
  { vehicle: 'Honda Civic', count: 6, avgLoan: 22100, avgAPR: 5.49 },
  { vehicle: 'Ford F-150', count: 5, avgLoan: 32000, avgAPR: 5.99 },
  { vehicle: 'Chevrolet Equinox', count: 4, avgLoan: 28300, avgAPR: 4.79 },
  { vehicle: 'Nissan Altima', count: 3, avgLoan: 20800, avgAPR: 7.29 },
];

export default function Reporting() {
  const [range, setRange] = useState<Range>('month');

  return (
    <div>
      {/* Date range */}
      <div className="flex gap-1 mb-8 bg-gray-50 rounded-xl p-1 w-fit border border-gray-200">
        {([['week', 'This Week'], ['month', 'This Month'], ['lastMonth', 'Last Month']] as [Range, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setRange(key)} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${range === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{label}</button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Apps Received', value: '80', delta: 12 },
          { label: 'Approval Rate', value: '68%', delta: 3 },
          { label: 'Avg APR', value: '5.24%', delta: undefined },
          { label: 'Funded Volume', value: '$892K', delta: 18 },
          { label: 'Referral Fees', value: '$13.5K', delta: undefined },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart: Apps by Week */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Applications by Week</h3>
          <BarChart data={weeklyData.map(d => ({ ...d, color: '#3B82F6' }))} height={220} showValues />
        </div>

        {/* Line Chart: Approval Rate */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Approval Rate Trend</h3>
          <LineChart data={approvalTrend} height={220} color="#22C55E" />
        </div>
      </div>

      {/* Pie Chart: By Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Applications by Credit Tier</h3>
          <DonutChart data={tierData} size={200} />
        </div>

        {/* Top Vehicles */}
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Top Vehicles Funded</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Vehicle', 'Count', 'Avg Loan', 'Avg APR'].map(h => (
                    <th key={h} className="text-left py-3 text-[10px] text-gray-600 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topVehicles.map((v, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{v.vehicle}</td>
                    <td className="py-3 text-gray-600">{v.count}</td>
                    <td className="py-3 text-gray-700">${v.avgLoan.toLocaleString()}</td>
                    <td className="py-3 text-gray-700">{v.avgAPR}%</td>
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
