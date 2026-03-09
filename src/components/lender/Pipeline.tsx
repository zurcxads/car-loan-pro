"use client";

import { useState } from 'react';
import { MOCK_APPLICATIONS, type MockApplication } from '@/lib/mock-data';
import { formatCurrency, ficoColor } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';

type ViewMode = 'kanban' | 'table';

interface KanbanColumn {
  key: string;
  label: string;
  status: string[];
}

const COLUMNS: KanbanColumn[] = [
  { key: 'pending', label: 'Pending Review', status: ['pending_decision'] },
  { key: 'approved', label: 'Approved/Offered', status: ['offers_available'] },
  { key: 'conditional', label: 'Conditions Pending', status: ['conditional'] },
  { key: 'funded', label: 'Funded', status: ['funded'] },
  { key: 'declined', label: 'Declined', status: ['declined'] },
];

function KanbanCard({ app }: { app: MockApplication }) {
  const daysInStage = Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="rounded-xl bg-zinc-800/50 border border-white/[0.06] p-3.5 hover:border-white/10 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-zinc-500">{app.id}</span>
        <span className="text-[10px] text-zinc-600">{daysInStage}d</span>
      </div>
      <div className="text-sm font-medium mb-1">{app.borrower.firstName} {app.borrower.lastName.charAt(0)}.</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{formatCurrency(app.loanAmount)}</span>
        <span className={`font-semibold ${ficoColor(app.credit.ficoScore)}`}>{app.credit.ficoScore ?? 'N/A'}</span>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const [view, setView] = useState<ViewMode>('kanban');
  const apps = MOCK_APPLICATIONS;

  const getAppsForColumn = (col: KanbanColumn) => apps.filter(a => col.status.includes(a.status));

  const exportCSV = () => {
    const funded = apps.filter(a => a.status === 'funded');
    const headers = ['App ID', 'Borrower', 'Vehicle', 'Loan Amount', 'Referral Fee'];
    const rows = funded.map(a => [
      a.id,
      `${a.borrower.firstName} ${a.borrower.lastName}`,
      `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}`,
      a.loanAmount.toString(),
      '300',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'funded_pipeline.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-zinc-900/60 rounded-xl p-1 border border-white/10">
          <button onClick={() => setView('kanban')} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${view === 'kanban' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500'}`}>Kanban</button>
          <button onClick={() => setView('table')} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${view === 'table' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500'}`}>Table</button>
        </div>
        {view === 'table' && (
          <button onClick={exportCSV} className="px-4 py-2 text-xs border border-white/10 hover:border-white/20 rounded-lg transition-colors cursor-pointer">Export CSV</button>
        )}
      </div>

      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map(col => {
            const colApps = getAppsForColumn(col);
            return (
              <div key={col.key} className="rounded-2xl surface p-4 min-h-[300px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-zinc-300">{col.label}</h3>
                  <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{colApps.length}</span>
                </div>
                <div className="space-y-2">
                  {colApps.map(app => <KanbanCard key={app.id} app={app} />)}
                  {colApps.length === 0 && <p className="text-xs text-zinc-600 text-center py-8">No applications</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'table' && (
        <div className="rounded-2xl surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['App ID', 'Borrower', 'Vehicle', 'Loan Amount', 'FICO', 'Status', 'Days in Stage', 'Referral Fee'].map(h => (
                    <th key={h} className="text-left py-4 px-5 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.map(app => {
                  const days = Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={app.id} className="border-b border-white/[0.04] hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-5 font-mono text-xs text-zinc-400">{app.id}</td>
                      <td className="py-4 px-5 font-medium">{app.borrower.firstName} {app.borrower.lastName.charAt(0)}.</td>
                      <td className="py-4 px-5 text-zinc-400">{app.vehicle.year} {app.vehicle.make} {app.vehicle.model}</td>
                      <td className="py-4 px-5">{formatCurrency(app.loanAmount)}</td>
                      <td className={`py-4 px-5 font-semibold ${ficoColor(app.credit.ficoScore)}`}>{app.credit.ficoScore ?? 'N/A'}</td>
                      <td className="py-4 px-5"><StatusBadge status={app.status} /></td>
                      <td className="py-4 px-5 text-zinc-400">{days}d</td>
                      <td className="py-4 px-5 text-green-400">{app.status === 'funded' ? '$300' : '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
