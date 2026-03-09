"use client";

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import KPICard from '@/components/shared/KPICard';

const weeklyFunded = [
  { week: 'W1', deals: 3 },
  { week: 'W2', deals: 5 },
  { week: 'W3', deals: 2 },
  { week: 'W4', deals: 4 },
];

const lenderBreakdown = [
  { name: 'Ally Financial', value: 4, color: '#3B82F6' },
  { name: 'Capital One', value: 3, color: '#22C55E' },
  { name: 'Chase Auto', value: 2, color: '#8B5CF6' },
  { name: 'Westlake', value: 3, color: '#F59E0B' },
];

const funnelData = [
  { stage: 'Buyers Received', count: 41, pct: 100 },
  { stage: 'Invited', count: 28, pct: 68 },
  { stage: 'Deal Started', count: 16, pct: 39 },
  { stage: 'Funded', count: 8, pct: 20 },
];

const tooltipStyle = {
  contentStyle: { backgroundColor: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' },
};

export default function PerformanceDashboard() {
  const [range, setRange] = useState('month');

  return (
    <div>
      <div className="flex gap-1 mb-8 bg-zinc-900/60 rounded-xl p-1 w-fit border border-white/10">
        {[['month', 'This Month'], ['lastMonth', 'Last Month'], ['90', 'Last 90 Days'], ['ytd', 'YTD']].map(([key, label]) => (
          <button key={key} onClick={() => setRange(key)} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${range === key ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500'}`}>{label}</button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KPICard label="Buyers Invited" value="28" delta="+5" deltaType="up" delay={0} />
        <KPICard label="Deals Started" value="16" delta="+3" deltaType="up" delay={0.05} />
        <KPICard label="Deals Funded" value="8" delta="+2" deltaType="up" delay={0.1} />
        <KPICard label="Avg Days to Fund" value="8.5" delta="-1.2" deltaType="up" delay={0.15} />
        <KPICard label="Total Funded" value="$218K" delta="+22%" deltaType="up" delay={0.2} />
        <KPICard label="Conversion Rate" value="29%" delta="+4%" deltaType="up" delay={0.25} />
      </div>

      {/* Funnel */}
      <div className="rounded-2xl surface p-6 mb-8">
        <h3 className="text-sm font-semibold mb-6">Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelData.map((step, i) => (
            <div key={step.stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-zinc-300">{step.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{step.count}</span>
                  {i > 0 && <span className="text-[10px] text-zinc-500">{Math.round((funnelData[i].count / funnelData[i - 1].count) * 100)}% from prev</span>}
                </div>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${step.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="rounded-2xl surface p-6">
          <h3 className="text-sm font-semibold mb-6">Funded Deals by Week</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyFunded}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="week" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="deals" fill="#3B82F6" name="Funded" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl surface p-6">
          <h3 className="text-sm font-semibold mb-6">Funding by Lender</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={lenderBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                  {lenderBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
