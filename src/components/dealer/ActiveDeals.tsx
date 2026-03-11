"use client";

import { useState } from 'react';
import { MOCK_DEALS, type MockDeal } from '@/lib/mock-data';
import { formatCurrency, formatAPR, formatDate } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';

type SubTab = 'progress' | 'funded' | 'declined';

const DEAL_STEPS = ['Deal Submitted', 'Lender Review', 'Approved for Funding', 'Wire Sent', 'Funded'];

function stepIndex(status: string): number {
  switch (status) {
    case 'submitted': return 0;
    case 'lender_review': return 1;
    case 'approved_for_funding': return 2;
    case 'wire_sent': return 3;
    case 'funded': return 4;
    default: return 0;
  }
}

export default function ActiveDeals() {
  const [subTab, setSubTab] = useState<SubTab>('progress');
  const [selectedDeal, setSelectedDeal] = useState<MockDeal | null>(null);

  const inProgress = MOCK_DEALS.filter(d => !['funded', 'declined'].includes(d.status));
  const funded = MOCK_DEALS.filter(d => d.status === 'funded');
  const declined = MOCK_DEALS.filter(d => d.status === 'declined');

  const current = subTab === 'progress' ? inProgress : subTab === 'funded' ? funded : declined;

  const exportCSV = () => {
    const headers = ['Deal ID', 'Buyer', 'Vehicle', 'Lender', 'Amount', 'Rate', 'Status'];
    const rows = current.map(d => [d.id, `${d.buyerFirstName} ${d.buyerLastInitial}.`, d.vehicle, d.lenderName, d.amount.toString(), d.rate.toString(), d.status]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deals_${subTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
          {([['progress', `In Progress (${inProgress.length})`], ['funded', `Funded (${funded.length})`], ['declined', `Declined (${declined.length})`]] as [SubTab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setSubTab(key)} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${subTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>{label}</button>
          ))}
        </div>
        <button onClick={exportCSV} className="px-4 py-2 text-xs border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer">Export CSV</button>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Deal ID', 'Buyer', 'Vehicle', 'Lender', 'Amount', 'Rate', 'Status', subTab === 'funded' ? 'Funded Date' : 'Days Open', 'Actions'].map(h => (
                  <th key={h} className="text-left py-4 px-5 text-[10px] text-gray-500 uppercase tracking-widest font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.map(deal => (
                <tr key={deal.id} onClick={() => setSelectedDeal(deal)} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="py-4 px-5 font-mono text-xs text-gray-500">{deal.id}</td>
                  <td className="py-4 px-5 font-medium">{deal.buyerFirstName} {deal.buyerLastInitial}.</td>
                  <td className="py-4 px-5 text-gray-500">{deal.vehicle}</td>
                  <td className="py-4 px-5 text-gray-700">{deal.lenderName}</td>
                  <td className="py-4 px-5">{formatCurrency(deal.amount)}</td>
                  <td className="py-4 px-5">{formatAPR(deal.rate)}</td>
                  <td className="py-4 px-5">
                    {/* Mini stepper */}
                    <div className="flex items-center gap-1">
                      {DEAL_STEPS.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i <= stepIndex(deal.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-gray-500">{subTab === 'funded' ? (deal.fundedAt ? formatDate(deal.fundedAt) : '--') : `${deal.daysOpen}d`}</td>
                  <td className="py-4 px-5"><StatusBadge status={deal.status} /></td>
                </tr>
              ))}
              {current.length === 0 && (
                <tr><td colSpan={9} className="py-16 text-center text-sm text-gray-500">No deals in this category</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deal detail drawer */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-white/50" onClick={() => setSelectedDeal(null)} />
          <div className="relative w-full max-w-md bg-white border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-gray-500">{selectedDeal.id}</span>
                <StatusBadge status={selectedDeal.status} />
              </div>
              <button onClick={() => setSelectedDeal(null)} className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[10px] text-gray-500 block">Buyer</span><span className="font-medium">{selectedDeal.buyerFirstName} {selectedDeal.buyerLastInitial}.</span></div>
                <div><span className="text-[10px] text-gray-500 block">Vehicle</span><span className="font-medium">{selectedDeal.vehicle}</span></div>
                <div><span className="text-[10px] text-gray-500 block">VIN</span><span className="font-mono text-xs">{selectedDeal.vin}</span></div>
                <div><span className="text-[10px] text-gray-500 block">Lender</span><span className="font-medium">{selectedDeal.lenderName}</span></div>
                <div><span className="text-[10px] text-gray-500 block">Amount</span><span className="font-semibold text-blue-600">{formatCurrency(selectedDeal.amount)}</span></div>
                <div><span className="text-[10px] text-gray-500 block">Rate</span><span className="font-medium">{formatAPR(selectedDeal.rate)}</span></div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-3">Timeline</h3>
                <div className="space-y-3">
                  {selectedDeal.events.map((evt, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-700">{evt.event}</div>
                        <div className="text-[10px] text-gray-400">{formatDate(evt.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
