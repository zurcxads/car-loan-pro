"use client";

import { useState, useMemo, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { type MockApplication } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime, ficoColor, ltvColor, dtiColor, ptiColor, truncate } from '@/lib/format-utils';
import DataTable from '@/components/shared/DataTable';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';
import DecisionModal from './DecisionModal';
import { dbGetApplications } from '@/lib/db';

const columnHelper = createColumnHelper<MockApplication>();

type StatusFilter = 'all' | 'pending_decision' | 'offers_available' | 'conditional' | 'declined' | 'funded';
type DecisionAction = 'approve' | 'decline' | 'counter' | 'request_docs';

export default function ApplicationQueue() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter[]>(['all']);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<MockApplication | null>(null);
  const [decisionApp, setDecisionApp] = useState<MockApplication | null>(null);
  const [decisionAction, setDecisionAction] = useState<DecisionAction>('approve');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
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
    if (!statusFilter.includes('all')) {
      filteredApps = filteredApps.filter(a => statusFilter.includes(a.status as StatusFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      filteredApps = filteredApps.filter(a =>
        a.id.toLowerCase().includes(q) ||
        `${a.borrower.firstName} ${a.borrower.lastName}`.toLowerCase().includes(q)
      );
    }
    return filteredApps;
  }, [apps, statusFilter, search]);

  const toggleStatus = (s: StatusFilter) => {
    if (s === 'all') {
      setStatusFilter(['all']);
      return;
    }
    const next = statusFilter.filter(x => x !== 'all');
    if (next.includes(s)) {
      const removed = next.filter(x => x !== s);
      setStatusFilter(removed.length === 0 ? ['all'] : removed);
    } else {
      setStatusFilter([...next, s]);
    }
  };

  const openDecision = (app: MockApplication, action: DecisionAction) => {
    setDecisionApp(app);
    setDecisionAction(action);
    setSelectedApp(null);
  };

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'App ID',
      cell: info => <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>,
      enableSorting: false,
    }),
    columnHelper.accessor(row => `${row.borrower.firstName} ${row.borrower.lastName.charAt(0)}.`, {
      id: 'borrower',
      header: 'Borrower',
      cell: info => <span className="font-medium text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor(row => row.credit.ficoScore, {
      id: 'fico',
      header: 'FICO',
      cell: info => {
        const val = info.getValue();
        return <span className={`font-semibold text-sm ${ficoColor(val)}`}>{val || 'N/A'}</span>;
      },
    }),
    columnHelper.accessor('loanAmount', {
      header: 'Loan Amount',
      cell: info => <span className="text-sm">{info.getValue() ? formatCurrency(info.getValue()!) : 'Pre-Approval'}</span>,
    }),
    columnHelper.accessor(row => row.vehicle ? `${row.vehicle.year} ${row.vehicle.make} ${row.vehicle.model}` : 'No vehicle', {
      id: 'vehicle',
      header: 'Vehicle',
      cell: info => <span className="text-sm text-gray-500">{truncate(info.getValue(), 25)}</span>,
      enableSorting: false,
    }),
    columnHelper.accessor('ltvPercent', {
      header: 'LTV',
      cell: info => <span className={`font-semibold text-sm ${ltvColor(info.getValue() || 0)}`}>{info.getValue() ?? 'N/A'}{info.getValue() ? '%' : ''}</span>,
    }),
    columnHelper.accessor('dtiPercent', {
      header: 'DTI',
      cell: info => <span className={`font-semibold text-sm ${dtiColor(info.getValue())}`}>{info.getValue()}%</span>,
    }),
    columnHelper.accessor('ptiPercent', {
      header: 'PTI',
      cell: info => <span className={`font-semibold text-sm ${ptiColor(info.getValue() || 0)}`}>{info.getValue() ?? 'N/A'}{info.getValue() ? '%' : ''}</span>,
    }),
    columnHelper.accessor('submittedAt', {
      header: 'Submitted',
      cell: info => <span className="text-xs text-gray-500">{formatRelativeTime(info.getValue())}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
  ], []);

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending_decision', label: 'Pending' },
    { key: 'offers_available', label: 'Approved' },
    { key: 'conditional', label: 'Conditional' },
    { key: 'declined', label: 'Declined' },
  ];

  // KPIs
  const newToday = apps.filter(a => new Date(a.submittedAt).toDateString() === new Date().toDateString()).length;
  const pendingReview = apps.filter(a => a.status === 'pending_decision').length;
  const approvedWeek = apps.filter(a => a.status === 'offers_available' || a.status === 'funded').length;

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
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="New Today" value={newToday} delay={0} />
        <KPICard label="Pending Review" value={pendingReview} delay={0.06} />
        <KPICard label="Approved This Week" value={approvedWeek} delay={0.12} />
        <KPICard label="Avg Decision Time" value="14 min" delay={0.18} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1">
          {statusOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => toggleStatus(opt.key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 cursor-pointer ${
                statusFilter.includes(opt.key)
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-gray-200 text-gray-500 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by App ID or name..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50 transition-colors duration-200"
          />
        </div>
        {statusFilter.length > 0 && !statusFilter.includes('all') && (
          <button onClick={() => setStatusFilter(['all'])} className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
        columns={columns}
        pageSize={10}
        onRowClick={setSelectedApp}
        globalFilter={search}
        enableSelection
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        getRowId={(row) => row.id}
      />

      {/* Detail Drawer */}
      {selectedApp && (
        <ApplicationDetailDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onApprove={() => openDecision(selectedApp, 'approve')}
          onDecline={() => openDecision(selectedApp, 'decline')}
          onCounter={() => openDecision(selectedApp, 'counter')}
          onRequestDocs={() => openDecision(selectedApp, 'request_docs')}
        />
      )}

      {/* Decision Modal */}
      {decisionApp && (
        <DecisionModal
          app={decisionApp}
          action={decisionAction}
          onClose={() => setDecisionApp(null)}
        />
      )}
    </div>
  );
}
