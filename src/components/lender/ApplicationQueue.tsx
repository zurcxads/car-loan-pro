"use client";

import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { MOCK_APPLICATIONS, type MockApplication } from '@/lib/mock-data';
import { formatCurrency, formatRelativeTime, ficoColor, ltvColor, dtiColor, ptiColor, truncate } from '@/lib/format-utils';
import DataTable from '@/components/shared/DataTable';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';
import DecisionModal from './DecisionModal';

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

  const filtered = useMemo(() => {
    let apps = [...MOCK_APPLICATIONS];
    if (!statusFilter.includes('all')) {
      apps = apps.filter(a => statusFilter.includes(a.status as StatusFilter));
    }
    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(a =>
        a.id.toLowerCase().includes(q) ||
        `${a.borrower.firstName} ${a.borrower.lastName}`.toLowerCase().includes(q)
      );
    }
    return apps;
  }, [statusFilter, search]);

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

  // KPIs
  const newToday = MOCK_APPLICATIONS.filter(a => new Date(a.submittedAt).toDateString() === new Date().toDateString()).length || 3;
  const pendingReview = MOCK_APPLICATIONS.filter(a => a.status === 'pending_decision').length;
  const approvedWeek = MOCK_APPLICATIONS.filter(a => a.status === 'offers_available' || a.status === 'funded').length;

  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'App ID',
      cell: info => <span className="font-mono text-xs text-zinc-400">{info.getValue()}</span>,
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
      cell: info => <span className="text-sm">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor(row => `${row.vehicle.year} ${row.vehicle.make} ${row.vehicle.model}`, {
      id: 'vehicle',
      header: 'Vehicle',
      cell: info => <span className="text-sm text-zinc-400">{truncate(info.getValue(), 25)}</span>,
      enableSorting: false,
    }),
    columnHelper.accessor('ltvPercent', {
      header: 'LTV',
      cell: info => <span className={`font-semibold text-sm ${ltvColor(info.getValue())}`}>{info.getValue()}%</span>,
    }),
    columnHelper.accessor('dtiPercent', {
      header: 'DTI',
      cell: info => <span className={`font-semibold text-sm ${dtiColor(info.getValue())}`}>{info.getValue()}%</span>,
    }),
    columnHelper.accessor('ptiPercent', {
      header: 'PTI',
      cell: info => <span className={`font-semibold text-sm ${ptiColor(info.getValue())}`}>{info.getValue()}%</span>,
    }),
    columnHelper.accessor('submittedAt', {
      header: 'Submitted',
      cell: info => <span className="text-xs text-zinc-500">{formatRelativeTime(info.getValue())}</span>,
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

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard label="New Today" value={newToday} delta="+2 vs yesterday" deltaType="up" delay={0} />
        <KPICard label="Pending Review" value={pendingReview} delay={0.06} />
        <KPICard label="Approved This Week" value={approvedWeek} delta="+3" deltaType="up" delay={0.12} />
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
                  ? 'bg-blue-600/15 border-blue-600/30 text-blue-400'
                  : 'border-white/10 text-zinc-500 hover:text-zinc-50'
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
            className="w-full px-4 py-2 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200"
          />
        </div>
        {statusFilter.length > 0 && !statusFilter.includes('all') && (
          <button onClick={() => setStatusFilter(['all'])} className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer">
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
