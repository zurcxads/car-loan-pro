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
  new: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
  contacted: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
  qualified: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
  sold: 'border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300',
  lost: 'border-gray-200 bg-gray-100 text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
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
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-zinc-100">Lead Management</h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400">Track and manage all your pre-approved buyer leads</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'new', 'contacted', 'qualified', 'sold', 'lost'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
              filter === f
                ? 'bg-blue-50 border-blue-200 text-blue-600 font-medium'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <span className="capitalize">{f}</span>
            <span className="ml-1.5 text-[10px] opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Lead</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Contact</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Approval</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Vehicle</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Assigned</th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredLeads.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-zinc-950"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">{lead.name}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400">{lead.creditTier} credit</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 dark:text-zinc-300">{lead.phone}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-blue-600">{formatCurrency(lead.approvalAmount)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 dark:text-zinc-300">{lead.vehicle || <span className="text-gray-400 dark:text-zinc-500">Not specified</span>}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-medium border ${statusColors[lead.status]}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 dark:text-zinc-300">{lead.assignedTo || '-'}</div>
                    {lead.lastContact && <div className="text-[10px] text-gray-500 dark:text-zinc-400">{lead.lastContact}</div>}
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
                          className="cursor-pointer rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
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
                        className="cursor-pointer p-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
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
            <svg className="mx-auto mb-4 h-10 w-10 text-gray-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-zinc-400">No leads match this filter</p>
          </div>
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLead(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)} className="cursor-pointer p-1 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-medium text-gray-900 dark:text-zinc-100">{selectedLead.name}</div>
                <div className="text-xs text-gray-600 dark:text-zinc-300">{selectedLead.phone}</div>
                <div className="text-xs text-gray-600 dark:text-zinc-300">{selectedLead.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-1 text-[10px] uppercase text-gray-500 dark:text-zinc-400">Approval Amount</div>
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(selectedLead.approvalAmount)}</div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase text-gray-500 dark:text-zinc-400">Credit Tier</div>
                  <div className="text-sm font-medium capitalize text-gray-900 dark:text-zinc-100">{selectedLead.creditTier}</div>
                </div>
              </div>

              {selectedLead.vehicle && (
                <div>
                  <div className="mb-1 text-[10px] uppercase text-gray-500 dark:text-zinc-400">Vehicle Interest</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">{selectedLead.vehicle}</div>
                </div>
              )}

              <div>
                <div className="mb-2 text-[10px] uppercase text-gray-500 dark:text-zinc-400">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {(['contacted', 'qualified', 'sold', 'lost'] as LeadStatus[]).map(status => (
                    <button
                      key={status}
                      onClick={() => updateLeadStatus(selectedLead.id, status)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        selectedLead.status === status
                          ? statusColors[status]
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] uppercase text-gray-500 dark:text-zinc-400">Notes</div>
                <textarea
                  placeholder="Add notes about this lead..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Contact Lead
              </button>
              <button onClick={() => setSelectedLead(null)} className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
