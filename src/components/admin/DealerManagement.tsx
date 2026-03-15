"use client";

import { useEffect, useState } from 'react';
import { MOCK_DEALERS, type MockDealer } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';

export default function DealerManagement() {
  const [dealers, setDealers] = useState(MOCK_DEALERS);
  const [selectedDealer, setSelectedDealer] = useState<MockDealer | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDealers() {
      try {
        const response = await fetch('/api/admin/dealers');
        const json = (await response.json()) as { success?: boolean; data?: { dealers?: MockDealer[] } };

        if (mounted && json.success && json.data?.dealers) {
          setDealers(json.data.dealers);
        }
      } catch {}
    }

    void loadDealers();

    return () => {
      mounted = false;
    };
  }, []);

  if (selectedDealer) {
    return (
      <div>
        <button onClick={() => setSelectedDealer(null)} className="text-xs text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dealers
        </button>

        <h2 className="text-lg font-semibold mb-6">{selectedDealer.name}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"><div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Buyers MTD</div><div className="text-2xl font-bold">{selectedDealer.buyersSentMTD}</div></div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"><div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Funded MTD</div><div className="text-2xl font-bold text-green-600">{selectedDealer.dealsFundedMTD}</div></div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"><div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Plan</div><div className="text-2xl font-bold text-blue-600">{selectedDealer.plan}</div></div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"><div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">MRR</div><div className="text-2xl font-bold">{formatCurrency(selectedDealer.planPrice)}</div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Dealership Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Address</span><span>{selectedDealer.address}, {selectedDealer.city}, {selectedDealer.state} {selectedDealer.zip}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selectedDealer.phone}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{selectedDealer.contactEmail}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Website</span><span>{selectedDealer.website}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Brands</span><span>{selectedDealer.franchiseBrands.join(', ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Joined</span><span>{selectedDealer.joinedDate}</span></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold mb-4">Team Members</h3>
            <div className="space-y-2">
              {selectedDealer.teamMembers.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div><div className="text-sm font-medium">{m.name}</div><div className="text-[10px] text-gray-500">{m.email}</div></div>
                  <div className="text-right"><div className="text-xs text-gray-500">{m.role}</div><span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{m.status}</span></div>
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
        <h2 className="text-lg font-semibold">Dealer Partners</h2>
        <button className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-gray-900 rounded-lg transition-colors cursor-pointer font-medium">Add Dealer</button>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Dealer Name', 'City', 'State', 'Contact', 'Status', 'Buyers MTD', 'Funded MTD', 'Plan', 'MRR', 'Joined'].map(h => (
                  <th key={h} className="text-left py-4 px-4 text-[10px] text-gray-500 uppercase tracking-widest font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dealers.map(dealer => (
                <tr key={dealer.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedDealer(dealer)}>
                  <td className="py-4 px-4 font-medium text-blue-600">{dealer.name}</td>
                  <td className="py-4 px-4 text-gray-500">{dealer.city}</td>
                  <td className="py-4 px-4 text-gray-500">{dealer.state}</td>
                  <td className="py-4 px-4 text-xs text-gray-500">{dealer.contactEmail}</td>
                  <td className="py-4 px-4"><span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600">{dealer.status}</span></td>
                  <td className="py-4 px-4">{dealer.buyersSentMTD}</td>
                  <td className="py-4 px-4 text-green-600">{dealer.dealsFundedMTD}</td>
                  <td className="py-4 px-4 text-gray-700">{dealer.plan}</td>
                  <td className="py-4 px-4">${dealer.planPrice}</td>
                  <td className="py-4 px-4 text-xs text-gray-500">{dealer.joinedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
