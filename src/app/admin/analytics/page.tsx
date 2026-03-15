"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { showDevTools } from '@/lib/env';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/components/shared/PortalLayout';

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

// SVG Line Chart component
function SvgLineChart({ data, xKey, yKey, color, label }: { data: Record<string, string | number>[]; xKey: string; yKey: string; color: string; label: string }) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>;

  const values = data.map(d => Number(d[yKey]));
  const maxVal = Math.max(...values, 1);
  const chartW = 600;
  const chartH = 240;
  const padL = 50;
  const padB = 40;
  const padT = 20;
  const padR = 20;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const points = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * plotW;
    const y = padT + plotH - (Number(d[yKey]) / maxVal) * plotH;
    return { x, y, label: String(d[xKey]), value: Number(d[yKey]) };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[300px]" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padT + plotH * (1 - pct);
        return <line key={pct} x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f0f0f0" strokeWidth={1} />;
      })}
      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padT + plotH * (1 - pct);
        return <text key={pct} x={padL - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">{Math.round(maxVal * pct)}</text>;
      })}
      {/* X-axis labels (show every nth) */}
      {points.filter((_, i) => data.length <= 10 || i % Math.ceil(data.length / 8) === 0).map(p => (
        <text key={p.label} x={p.x} y={chartH - 8} textAnchor="middle" className="text-[10px] fill-gray-400">{p.label}</text>
      ))}
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {/* Legend */}
      <rect x={padL} y={chartH - 4} width={10} height={3} rx={1} fill={color} />
      <text x={padL + 14} y={chartH} className="text-[10px] fill-gray-500">{label}</text>
    </svg>
  );
}

// SVG Bar Chart component
function SvgBarChart({ data, xKey, yKey, color, label }: { data: Record<string, string | number>[]; xKey: string; yKey: string; color: string; label: string }) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>;

  const values = data.map(d => Number(d[yKey]));
  const maxVal = Math.max(...values, 1);
  const chartW = 600;
  const chartH = 260;
  const padL = 50;
  const padB = 50;
  const padT = 20;
  const padR = 20;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const barW = Math.min(40, (plotW / data.length) * 0.6);
  const gap = (plotW - barW * data.length) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[300px]" preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padT + plotH * (1 - pct);
        return <line key={pct} x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f0f0f0" strokeWidth={1} />;
      })}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padT + plotH * (1 - pct);
        return <text key={pct} x={padL - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">{Math.round(maxVal * pct)}</text>;
      })}
      {data.map((d, i) => {
        const val = Number(d[yKey]);
        const barH = (val / maxVal) * plotH;
        const x = padL + gap + i * (barW + gap);
        const y = padT + plotH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={color} />
            <text x={x + barW / 2} y={chartH - padB + 16} textAnchor="middle" className="text-[10px] fill-gray-400" transform={`rotate(-30, ${x + barW / 2}, ${chartH - padB + 16})`}>{String(d[xKey])}</text>
          </g>
        );
      })}
      <rect x={padL} y={chartH - 8} width={10} height={3} rx={1} fill={color} />
      <text x={padL + 14} y={chartH - 4} className="text-[10px] fill-gray-500">{label}</text>
    </svg>
  );
}

// SVG Horizontal Bar Chart
function SvgHorizontalBarChart({ data, labelKey, valueKey, color, label }: { data: Record<string, string | number>[]; labelKey: string; valueKey: string; color: string; label: string }) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>;

  const maxVal = Math.max(...data.map(d => Number(d[valueKey])), 1);

  return (
    <div className="space-y-3 py-4">
      {data.map((d, i) => {
        const val = Number(d[valueKey]);
        const pct = (val / maxVal) * 100;
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{String(d[labelKey])}</span>
              <span className="text-gray-900 font-medium">{val}</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-md overflow-hidden">
              <div className="h-full rounded-md transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2 pt-2">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  );
}

// SVG Pie/Donut Chart
function SvgPieChart({ data, valueKey, labelKey, colors }: { data: Record<string, string | number>[]; valueKey: string; labelKey: string; colors: string[] }) {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>;

  const total = data.reduce((sum, d) => sum + Number(d[valueKey]), 0);
  if (total === 0) return <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>;

  const cx = 100;
  const cy = 100;
  const r = 80;
  let cumAngle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const val = Number(d[valueKey]);
    const angle = (val / total) * 2 * Math.PI;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = colors[i % colors.length];

    return { path, color, label: String(d[labelKey]), pct: Math.round((val / total) * 100) };
  });

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-48 h-48 flex-shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={2} />
        ))}
      </svg>
      <div className="space-y-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-700">{s.label} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [dateRange, setDateRange] = useState('30');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const isDevMode = showDevTools();

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

  if (isLoading || (!isAuthenticated && !isDevMode)) {
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
              <SvgLineChart data={data.applicationsPerDay} xKey="date" yKey="count" color="#2563eb" label="Applications" />
            </div>

            {/* Offers Per Lender */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Offers Per Lender</h3>
              <SvgBarChart data={data.offersPerLender} xKey="lender" yKey="count" color="#2563eb" label="Offers" />
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
              <SvgHorizontalBarChart data={data.conversionFunnel} labelKey="stage" valueKey="count" color="#10b981" label="Count" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Approval Rates by Credit Tier */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-6">Approval Rates by Credit Tier</h3>
                <SvgPieChart data={data.approvalRatesByTier} valueKey="rate" labelKey="tier" colors={COLORS} />
              </div>

              {/* Average APR Trend */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-6">Average APR Trend</h3>
                <SvgLineChart data={data.avgAprTrend} xKey="month" yKey="avgApr" color="#f59e0b" label="Avg APR (%)" />
              </div>
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
