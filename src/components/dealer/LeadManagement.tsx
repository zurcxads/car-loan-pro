"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'sold' | 'lost';
type Filter = 'all' | 'new' | 'contacted' | 'qualified' | 'sold' | 'lost';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  approvalAmount: number;
  creditTier: string;
  vehicle?: string;
  status: LeadStatus;
  lastContact?: string;
  assignedTo?: string;
  notes?: string;
}

const MOCK_LEADS: Lead[] = MOCK_APPLICATIONS.slice(0, 12).map((app, i) => ({
  id: app.id,
  name: `${app.borrower.firstName} ${app.borrower.lastName}`,
  phone: '(555) 123-4567',
  email: app.borrower.email,
  approvalAmount: app.loanAmount || 25000,
  creditTier: app.credit.scoreTier,
  vehicle: app.vehicle ? `${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model}` : undefined,
  status: ['new', 'contacted', 'qualified', 'sold', 'lost'][i % 5] as LeadStatus,
  lastContact: i % 3 === 0 ? '2 hours ago' : undefined,
  assignedTo: i % 2 === 0 ? 'You' : 'Sarah M.',
}));

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  qualified: 'bg-purple-100 text-purple-700 border-purple-200',
  sold: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function LeadManagement() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const filteredLeads = useMemo(() => {
    if (filter === 'all') return leads;
    return leads.filter(l => l.status === filter);
  }, [leads, filter]);

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, status } : null);
    }
  };

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    sold: leads.filter(l => l.status === 'sold').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Lead Management</h2>
        <p className="text-xs text-gray-500">Track and manage all your pre-approved buyer leads</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'new', 'contacted', 'qualified', 'sold', 'lost'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
              filter === f
                ? 'bg-blue-50 border-blue-200 text-blue-600 font-medium'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="capitalize">{f}</span>
            <span className="ml-1.5 text-[10px] opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Lead</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Approval</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeads.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.creditTier} credit</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">{lead.phone}</div>
                    <div className="text-xs text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-blue-600">{formatCurrency(lead.approvalAmount)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">{lead.vehicle || <span className="text-gray-400">Not specified</span>}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium border ${statusColors[lead.status]}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">{lead.assignedTo || '-'}</div>
                    {lead.lastContact && <div className="text-[10px] text-gray-500">{lead.lastContact}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {lead.status === 'new' && (
                        <button
                          onClick={() => updateLeadStatus(lead.id, 'contacted')}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Contacted
                        </button>
                      )}
                      {lead.status === 'contacted' && (
                        <button
                          onClick={() => updateLeadStatus(lead.id, 'qualified')}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-[10px] font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Qualified
                        </button>
                      )}
                      {lead.status === 'qualified' && (
                        <button
                          onClick={() => updateLeadStatus(lead.id, 'sold')}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-[10px] font-medium rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Sold
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="py-16 text-center">
            <svg className="w-10 h-10 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500">No leads match this filter</p>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedLead(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">{selectedLead.name}</div>
                <div className="text-xs text-gray-600">{selectedLead.phone}</div>
                <div className="text-xs text-gray-600">{selectedLead.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Approval Amount</div>
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(selectedLead.approvalAmount)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Credit Tier</div>
                  <div className="text-sm font-medium capitalize">{selectedLead.creditTier}</div>
                </div>
              </div>

              {selectedLead.vehicle && (
                <div>
                  <div className="text-[10px] text-gray-500 uppercase mb-1">Vehicle Interest</div>
                  <div className="text-sm font-medium">{selectedLead.vehicle}</div>
                </div>
              )}

              <div>
                <div className="text-[10px] text-gray-500 uppercase mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {(['contacted', 'qualified', 'sold', 'lost'] as LeadStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        selectedLead.status === status
                          ? statusColors[status]
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-gray-500 uppercase mb-2">Notes</div>
                <textarea
                  placeholder="Add notes about this lead..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                Contact Lead
              </button>
              <button onClick={() => setSelectedLead(null)} className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
