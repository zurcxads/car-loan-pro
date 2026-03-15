"use client";

import { useState, useMemo, useEffect } from 'react';
import { type MockApplication } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime, ficoColor, ltvColor, dtiColor } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';
import ApplicationDetailDrawer from '@/components/lender/ApplicationDetailDrawer';
import { dbGetApplications } from '@/lib/db';

export default function ApplicationManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<MockApplication | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [apps, setApps] = useState<MockApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApps() {
      setLoading(true);
      try {
        const data = await dbGetApplications();
        setApps(data);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  const filtered = useMemo(() => {
    let filteredApps = [...apps];
    if (statusFilter !== 'all') filteredApps = filteredApps.filter(a => a.status === statusFilter);
    if (stateFilter !== 'all') filteredApps = filteredApps.filter(a => a.state === stateFilter);
    if (search) {
      const q = search.toLowerCase();

      // SECURITY: Only allow searching by last 4 digits of SSN (not full SSN)
      const isSSNSearch = /^\d{4}$/.test(q);
      const ssnMatches = (a: MockApplication) => isSSNSearch && a.borrower.ssn.slice(-4) === q;

      filteredApps = filteredApps.filter(a =>
        a.id.toLowerCase().includes(q) ||
        `${a.borrower.firstName} ${a.borrower.lastName}`.toLowerCase().includes(q) ||
        a.borrower.email.toLowerCase().includes(q) ||
        ssnMatches(a)
      );
    }
    return filteredApps;
  }, [apps, search, statusFilter, stateFilter]);

  const states = Array.from(new Set(apps.map(a => a.state))).sort();
  const statuses = Array.from(new Set(apps.map(a => a.status)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ID, name, email, SSN last 4..."
          className="flex-1 min-w-[250px] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer">
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer">
          <option value="all">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filtered.length} application{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">ID</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Borrower</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Date</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Credit Tier</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Status</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Lenders</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map(app => (
              <>
                <tr
                  key={app.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleRow(app.id)}
                >
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{app.id}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900">{app.borrower.firstName} {app.borrower.lastName}</div>
                    <div className="text-xs text-gray-500">{app.borrower.email}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{formatRelativeTime(app.submittedAt)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium ${ficoColor(app.credit.ficoScore)}`}>
                      {app.credit.scoreTier.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={app.status} /></td>
                  <td className="py-3 px-4 text-sm font-medium">{app.loanAmount ? formatCurrency(app.loanAmount) : 'Pre-Approval'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{app.lendersSubmitted} sent / {app.offersReceived} offers</td>
                  <td className="py-3 px-4">
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedRow === app.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </td>
                </tr>
                {expandedRow === app.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="p-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900 mb-3">Credit Profile</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">FICO:</span>
                              <span className={`font-medium ${ficoColor(app.credit.ficoScore)}`}>{app.credit.ficoScore || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">DTI:</span>
                              <span className={`font-medium ${dtiColor(app.dtiPercent)}`}>{app.dtiPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">LTV:</span>
                              <span className={`font-medium ${ltvColor(app.ltvPercent || 0)}`}>{app.ltvPercent || 'N/A'}{app.ltvPercent ? '%' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900 mb-3">Employment</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Income:</span>
                              <span className="font-medium">{formatCurrency(app.employment.grossMonthlyIncome)}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Employer:</span>
                              <span className="font-medium text-right">{app.employment.employer}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-900 mb-3">Vehicle</h4>
                          <div className="space-y-2 text-sm">
                            {app.vehicle ? (
                              <>
                                <div className="font-medium">{app.vehicle.year} {app.vehicle.make} {app.vehicle.model}</div>
                                <div className="text-gray-600">{app.vehicle.mileage?.toLocaleString()} mi</div>
                                <div className="text-gray-600">Asking: {formatCurrency(app.vehicle.askingPrice)}</div>
                              </>
                            ) : (
                              <div className="text-gray-500">Pre-Approval (No vehicle)</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => setSelectedApp(app)} className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                          View Full Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-500">No applications found</div>
        )}
        {filtered.length > 20 && (
          <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-200">
            Showing first 20 of {filtered.length} results
          </div>
        )}
      </div>

      {selectedApp && (
        <ApplicationDetailDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onApprove={() => setSelectedApp(null)}
          onDecline={() => setSelectedApp(null)}
          onCounter={() => setSelectedApp(null)}
          onRequestDocs={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
