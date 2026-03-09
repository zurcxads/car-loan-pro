"use client";

import { useState } from 'react';
import { MOCK_LENDERS, type MockLender } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';
import KPICard from '@/components/shared/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tooltipStyle = {
  contentStyle: { backgroundColor: '#18181B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' },
};

export default function LenderManagement() {
  const [lenders, setLenders] = useState(MOCK_LENDERS);
  const [selectedLender, setSelectedLender] = useState<MockLender | null>(null);

  const toggleActive = (id: string) => {
    setLenders(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
  };

  // Detail view
  if (selectedLender) {
    const monthlyData = [
      { month: 'Oct', approved: 62, volume: 850000 },
      { month: 'Nov', approved: 68, volume: 1050000 },
      { month: 'Dec', approved: 55, volume: 720000 },
      { month: 'Jan', approved: 70, volume: 1100000 },
      { month: 'Feb', approved: 72, volume: 1250000 },
      { month: 'Mar', approved: selectedLender.approvalRate, volume: selectedLender.totalFundedVolume / 6 },
    ];

    return (
      <div>
        <button onClick={() => setSelectedLender(null)} className="text-xs text-zinc-500 hover:text-zinc-50 mb-6 flex items-center gap-1 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Lenders
        </button>

        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-lg font-semibold">{selectedLender.name}</h2>
          <StatusBadge status={selectedLender.tier} />
          <span className="text-xs text-zinc-500">{selectedLender.integrationStatus}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <KPICard label="Apps MTD" value={selectedLender.appsReceivedMTD} delay={0} />
          <KPICard label="Approval Rate" value={`${selectedLender.approvalRate}%`} delay={0.05} />
          <KPICard label="Avg APR" value={`${selectedLender.rateTiers[0]?.rateMin || 0}%`} delay={0.1} />
          <KPICard label="Avg Decision" value={`${selectedLender.avgDecisionTimeMinutes}m`} delay={0.15} />
          <KPICard label="Funded Volume" value={formatCurrency(selectedLender.totalFundedVolume)} delay={0.2} />
          <KPICard label="Fees Owed" value={formatCurrency(selectedLender.totalReferralFeesOwed)} delay={0.25} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl surface p-6">
            <h3 className="text-sm font-semibold mb-6">Approval Rate by Month</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="approved" fill="#3B82F6" name="Approval %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl surface p-6">
            <h3 className="text-sm font-semibold mb-6">Rate Tiers</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-[10px] text-zinc-500 uppercase tracking-wider">FICO Range</th>
                  <th className="text-left py-3 text-[10px] text-zinc-500 uppercase tracking-wider">Rate Range</th>
                </tr>
              </thead>
              <tbody>
                {selectedLender.rateTiers.map((t, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="py-3">{t.ficoMin} - {t.ficoMax}</td>
                    <td className="py-3">{t.rateMin}% - {t.rateMax}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Lender Network</h2>
        <button className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer font-medium">Add Lender</button>
      </div>

      <div className="rounded-2xl surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Lender', 'Tier', 'Integration', 'Min FICO', 'Max LTV', 'Apps MTD', 'Approval %', 'Avg Time', 'Referral Fee', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-4 px-4 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lenders.map(lender => (
                <tr key={lender.id} className="border-b border-white/[0.04] hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-4"><button onClick={() => setSelectedLender(lender)} className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer">{lender.name}</button></td>
                  <td className="py-4 px-4"><StatusBadge status={lender.tier} /></td>
                  <td className="py-4 px-4 text-zinc-400 text-xs">{lender.integrationStatus}</td>
                  <td className="py-4 px-4">{lender.minFico}</td>
                  <td className="py-4 px-4">{lender.maxLtv}%</td>
                  <td className="py-4 px-4 text-zinc-300">{lender.appsReceivedMTD}</td>
                  <td className="py-4 px-4 text-zinc-300">{lender.approvalRate}%</td>
                  <td className="py-4 px-4 text-zinc-400">{lender.avgDecisionTimeMinutes}m</td>
                  <td className="py-4 px-4 text-green-400">${lender.referralFee}</td>
                  <td className="py-4 px-4">
                    <div
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${lender.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}
                      onClick={() => toggleActive(lender.id)}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${lender.isActive ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button onClick={() => setSelectedLender(lender)} className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
