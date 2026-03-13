"use client";

import { useState, useMemo, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { type MockApplication } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime, ficoColor, ltvColor, dtiColor } from '@/lib/format-utils';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ApplicationDetailDrawer from '@/components/lender/ApplicationDetailDrawer';
import { dbGetApplications, dbUpdateApplication } from '@/lib/db';

const columnHelper = createColumnHelper<MockApplication>();

export default function ApplicationManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<MockApplication | null>(null);
  const [apps, setApps] = useState<MockApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

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

  const columns = useMemo(() => [
    columnHelper.accessor('id', { header: 'App ID', cell: info => <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>, enableSorting: false }),
    columnHelper.accessor(row => `${row.borrower.firstName} ${row.borrower.lastName}`, { id: 'borrower', header: 'Borrower', cell: info => <span className="font-medium text-sm">{info.getValue()}</span> }),
    columnHelper.accessor(row => row.credit.ficoScore, { id: 'fico', header: 'FICO', cell: info => <span className={`font-semibold text-sm ${ficoColor(info.getValue())}`}>{info.getValue() || 'N/A'}</span> }),
    columnHelper.accessor('loanAmount', { header: 'Loan Amt', cell: info => <span className="text-sm">{info.getValue() ? formatCurrency(info.getValue()!) : 'Pre-Approval'}</span> }),
    columnHelper.accessor('state', { header: 'State', cell: info => <span className="text-sm text-gray-500">{info.getValue()}</span> }),
    columnHelper.accessor('ltvPercent', { header: 'LTV', cell: info => <span className={`font-semibold text-sm ${ltvColor(info.getValue() || 0)}`}>{info.getValue() || 'N/A'}{info.getValue() ? '%' : ''}</span> }),
    columnHelper.accessor('dtiPercent', { header: 'DTI', cell: info => <span className={`font-semibold text-sm ${dtiColor(info.getValue())}`}>{info.getValue()}%</span> }),
    columnHelper.accessor('lendersSubmitted', { header: 'Lenders', cell: info => <span className="text-sm text-gray-500">{info.getValue()}</span> }),
    columnHelper.accessor('offersReceived', { header: 'Offers', cell: info => <span className="text-sm text-gray-700">{info.getValue()}</span> }),
    columnHelper.accessor('submittedAt', { header: 'Submitted', cell: info => <span className="text-xs text-gray-500">{formatRelativeTime(info.getValue())}</span> }),
    columnHelper.accessor('status', { header: 'Status', cell: info => <StatusBadge status={info.getValue()} /> }),
    columnHelper.accessor('flags', {
      header: 'Flags',
      cell: info => {
        const flags = info.getValue();
        return flags.length > 0 ? (
          <div className="flex gap-1">{flags.map((f, i) => <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-500">{f}</span>)}</div>
        ) : <span className="text-gray-400">--</span>;
      },
      enableSorting: false,
    }),
  ], []);

  const states = Array.from(new Set(apps.map(a => a.state))).sort();
  const statuses = Array.from(new Set(apps.map(a => a.status)));

  const handleBulkApprove = async () => {
    if (selectedApps.size === 0) return;
    const ids = Array.from(selectedApps);
    for (const id of ids) {
      await dbUpdateApplication(id, { status: 'offers_available' });
    }
    const updated = await dbGetApplications();
    setApps(updated);
    setSelectedApps(new Set());
  };

  const handleBulkFlag = async () => {
    if (selectedApps.size === 0) return;
    const ids = Array.from(selectedApps);
    for (const id of ids) {
      const app = apps.find(a => a.id === id);
      if (app) {
        await dbUpdateApplication(id, { flags: [...app.flags, 'Flagged for Review'] });
      }
    }
    const updated = await dbGetApplications();
    setApps(updated);
    setSelectedApps(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ID, name, email, SSN last 4..."
          className="flex-1 min-w-[250px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
          <option value="all">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedApps.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <span className="text-sm text-blue-900 font-medium">{selectedApps.size} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkApprove} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Approve Selected
            </button>
            <button onClick={handleBulkFlag} className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
              Flag Selected
            </button>
            <button onClick={() => setSelectedApps(new Set())} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      <DataTable
        data={filtered}
        columns={columns}
        pageSize={10}
        onRowClick={setSelectedApp}
        getRowId={(row) => row.id}
      />

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
