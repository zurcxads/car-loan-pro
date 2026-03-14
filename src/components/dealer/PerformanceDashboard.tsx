"use client";

import { useState } from 'react';
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

function SimpleBarChart({ data, dataKey, labelKey }: { data: { [key: string]: string | number }[]; dataKey: string; labelKey: string }) {
  const maxVal = Math.max(...data.map(d => Number(d[dataKey])));
  const chartH = 180;
  const barW = 40;
  const gap = 20;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <svg viewBox={`0 0 ${totalW + 40} ${chartH + 30}`} className="w-full h-56">
      {data.map((d, i) => {
        const val = Number(d[dataKey]);
        const barH = maxVal > 0 ? (val / maxVal) * chartH : 0;
        const x = 20 + i * (barW + gap);
        const y = chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#3B82F6" />
            <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" className="fill-gray-500 text-[11px] dark:fill-zinc-400">{String(d[labelKey])}</text>
            <text x={x + barW / 2} y={y - 6} textAnchor="middle" className="fill-gray-700 text-[11px] font-medium dark:fill-zinc-300">{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SimpleDonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = 100;
  const cy = 100;
  const outerR = 85;
  const innerR = 55;
  let cumAngle = -Math.PI / 2;

  const arcs = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const x1 = cx + outerR * Math.cos(startAngle);
    const y1 = cy + outerR * Math.sin(startAngle);
    const x2 = cx + outerR * Math.cos(endAngle);
    const y2 = cy + outerR * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return { ...d, path, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-44 h-44 flex-shrink-0">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill={arc.color} />
        ))}
      </svg>
      <div className="space-y-2 text-sm">
        {arcs.map((arc, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: arc.color }} />
            <span className="text-gray-700 dark:text-zinc-300">{arc.name} {arc.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerformanceDashboard() {
  const [range, setRange] = useState('month');

  return (
    <div>
      <div className="mb-8 flex w-fit gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/50">
        {[['month', 'This Month'], ['lastMonth', 'Last Month'], ['90', 'Last 90 Days'], ['ytd', 'YTD']].map(([key, label]) => (
          <button key={key} onClick={() => setRange(key)} className={`cursor-pointer rounded-lg px-4 py-2 text-xs transition-colors ${range === key ? 'bg-white text-gray-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100' : 'text-gray-500 dark:text-zinc-400'}`}>{label}</button>
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
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="mb-6 text-sm font-semibold text-gray-900 dark:text-zinc-100">Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelData.map((step, i) => (
            <div key={step.stage}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-zinc-300">{step.stage}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">{step.count}</span>
                  {i > 0 && <span className="text-[10px] text-gray-500 dark:text-zinc-400">{Math.round((funnelData[i].count / funnelData[i - 1].count) * 100)}% from prev</span>}
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${step.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-6 text-sm font-semibold text-gray-900 dark:text-zinc-100">Funded Deals by Week</h3>
          <SimpleBarChart data={weeklyFunded} dataKey="deals" labelKey="week" />
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-6 text-sm font-semibold text-gray-900 dark:text-zinc-100">Funding by Lender</h3>
          <SimpleDonutChart data={lenderBreakdown} />
        </div>
      </div>
    </div>
  );
}
