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
        {[
          { label: 'New Today', value: newToday },
          { label: 'Pending Review', value: pendingReview },
          { label: 'Approved This Week', value: approvedWeek },
          { label: 'Avg Decision Time', value: '14 min' },
        ].map((metric, i) => (
          <div key={i} className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{metric.label}</div>
            <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {statusOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => toggleStatus(opt.key)}
              className={`px-4 py-2 text-sm rounded-xl border transition-colors duration-200 cursor-pointer ${
                statusFilter.includes(opt.key)
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
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
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
        </div>
        {statusFilter.length > 0 && !statusFilter.includes('all') && (
          <button onClick={() => setStatusFilter(['all'])} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
            Clear Filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {filtered.length} application{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">ID</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Borrower</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Credit Tier</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Match Score</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Status</th>
              <th className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map(app => {
              const matchScore = Math.min(95, 60 + (app.credit.ficoScore || 600) / 15);
              return (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-xs text-gray-500">{app.id}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-gray-900">{app.borrower.firstName} {app.borrower.lastName.charAt(0)}.</div>
                    <div className="text-xs text-gray-500">{app.state}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${ficoColor(app.credit.ficoScore)}`}>
                      {app.credit.scoreTier.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{app.loanAmount ? formatCurrency(app.loanAmount) : 'Pre-Approval'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[60px]">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${matchScore}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{Math.round(matchScore)}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4"><StatusBadge status={app.status} /></td>
                  <td className="py-4 px-4">
                    <button onClick={() => setSelectedApp(app)} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
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
