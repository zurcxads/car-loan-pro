"use client";

import { useState } from 'react';
import { MOCK_LENDERS, type MockLender } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';
import { BarChart as SimpleBarChart } from '@/components/shared/charts';

export default function LenderManagement() {
  const [lenders, setLenders] = useState(MOCK_LENDERS);
  const [selectedLender, setSelectedLender] = useState<MockLender | null>(null);

  const toggleActive = (id: string) => {
    setLenders(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));
  };

  // Detail view
  if (selectedLender) {
    const approvalData = [
      { label: 'Oct', value: 62, color: '#3B82F6' },
      { label: 'Nov', value: 68, color: '#3B82F6' },
      { label: 'Dec', value: 55, color: '#3B82F6' },
      { label: 'Jan', value: 70, color: '#3B82F6' },
      { label: 'Feb', value: 72, color: '#3B82F6' },
      { label: 'Mar', value: selectedLender.approvalRate, color: '#3B82F6' },
    ];

    return (
      <div>
        <button onClick={() => setSelectedLender(null)} className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 cursor-pointer transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Lenders
        </button>

        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">{selectedLender.name}</h2>
          <StatusBadge status={selectedLender.tier} />
          <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">{selectedLender.integrationStatus}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Apps MTD', value: selectedLender.appsReceivedMTD },
            { label: 'Approval Rate', value: `${selectedLender.approvalRate}%` },
            { label: 'Avg APR', value: `${selectedLender.rateTiers[0]?.rateMin || 0}%` },
            { label: 'Avg Decision', value: `${selectedLender.avgDecisionTimeMinutes}m` },
            { label: 'Funded Volume', value: formatCurrency(selectedLender.totalFundedVolume) },
            { label: 'Fees Owed', value: formatCurrency(selectedLender.totalReferralFeesOwed) },
          ].map((metric, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{metric.label}</div>
              <div className="text-xl font-semibold text-gray-900">{metric.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-6">Approval Rate by Month</h3>
            <SimpleBarChart data={approvalData} height={220} showValues />
          </div>

          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-6">Rate Tiers</h3>
            <div className="space-y-3">
              {selectedLender.rateTiers.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{t.ficoMin} - {t.ficoMax}</div>
                    <div className="text-xs text-gray-500">FICO Range</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{t.rateMin}% - {t.rateMax}%</div>
                    <div className="text-xs text-gray-500">APR Range</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Lender Network</h2>
          <p className="text-sm text-gray-500 mt-1">{lenders.filter(l => l.isActive).length} active lenders</p>
        </div>
        <button className="px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors cursor-pointer font-medium">Add Lender</button>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Lender', 'Tier', 'Integration', 'Min FICO', 'Max LTV', 'Apps MTD', 'Approval %', 'Avg Time', 'Fee', 'Active'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lenders.map(lender => (
                <tr
                  key={lender.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLender(lender)}
                >
                  <td className="py-4 px-4">
                    <div className="font-medium text-blue-600 hover:text-blue-500">{lender.name}</div>
                  </td>
                  <td className="py-4 px-4"><StatusBadge status={lender.tier} /></td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${lender.integrationStatus === 'API' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {lender.integrationStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{lender.minFico}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{lender.maxLtv}%</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{lender.appsReceivedMTD}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{lender.approvalRate}%</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{lender.avgDecisionTimeMinutes}m</td>
                  <td className="py-4 px-4 text-sm font-medium text-green-600">${lender.referralFee}</td>
                  <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <div
                      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${lender.isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
                      onClick={() => toggleActive(lender.id)}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${lender.isActive ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                    </div>
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
