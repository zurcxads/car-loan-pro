"use client";

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import KPICard from '@/components/shared/KPICard';

type Range = 'week' | 'month' | 'lastMonth' | 'custom';

const weeklyData = [
  { week: 'W1', received: 18, approved: 12, funded: 8 },
  { week: 'W2', received: 22, approved: 15, funded: 10 },
  { week: 'W3', received: 15, approved: 10, funded: 7 },
  { week: 'W4', received: 25, approved: 18, funded: 13 },
];

const approvalTrend = [
  { week: 'W1', rate: 67 },
  { week: 'W2', rate: 68 },
  { week: 'W3', rate: 67 },
  { week: 'W4', rate: 72 },
];

const tierData = [
  { name: 'Prime', value: 42, color: '#22C55E' },
  { name: 'Near-Prime', value: 35, color: '#3B82F6' },
  { name: 'Subprime', value: 23, color: '#F59E0B' },
];

const topVehicles = [
  { vehicle: 'Toyota Camry', count: 8, avgLoan: 26500, avgAPR: 4.89 },
  { vehicle: 'Honda Civic', count: 6, avgLoan: 22100, avgAPR: 5.49 },
  { vehicle: 'Ford F-150', count: 5, avgLoan: 32000, avgAPR: 5.99 },
  { vehicle: 'Chevrolet Equinox', count: 4, avgLoan: 28300, avgAPR: 4.79 },
  { vehicle: 'Nissan Altima', count: 3, avgLoan: 20800, avgAPR: 7.29 },
];

const tooltipStyle = {
  contentStyle: { backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '12px' },
  labelStyle: { color: '#6B7280' },
};

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
        <KPICard label="Apps Received" value="80" delta="+12% MoM" deltaType="up" delay={0} />
        <KPICard label="Approval Rate" value="68%" delta="+3%" deltaType="up" delay={0.06} />
        <KPICard label="Avg APR" value="5.24%" delay={0.12} />
        <KPICard label="Funded Volume" value="$892K" delta="+18%" deltaType="up" delay={0.18} />
        <KPICard label="Referral Fees" value="$13.5K" delay={0.24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart: Apps by Week */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-6">Applications by Week</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="received" fill="#3B82F6" name="Received" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#22C55E" name="Approved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="funded" fill="#8B5CF6" name="Funded" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Approval Rate */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-6">Approval Rate Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={approvalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                <YAxis domain={[50, 80]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} name="Approval %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart: By Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-6">Applications by Credit Tier</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tierData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {tierData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vehicles */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-6">Top Vehicles Funded</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Vehicle', 'Count', 'Avg Loan', 'Avg APR'].map(h => (
                  <th key={h} className="text-left py-3 text-[10px] text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topVehicles.map((v, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 font-medium">{v.vehicle}</td>
                  <td className="py-3 text-gray-500">{v.count}</td>
                  <td className="py-3 text-gray-700">${v.avgLoan.toLocaleString()}</td>
                  <td className="py-3 text-gray-700">{v.avgAPR}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
