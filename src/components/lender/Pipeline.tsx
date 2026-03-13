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
    <div className="rounded-lg bg-white border border-gray-200 p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-gray-500">{app.id}</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{daysInStage}d</span>
      </div>
      <div className="text-sm font-medium text-gray-900 mb-2">{app.borrower.firstName} {app.borrower.lastName.charAt(0)}.</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{app.loanAmount ? formatCurrency(app.loanAmount) : 'Pre-Approval'}</span>
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
      a.vehicle ? `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}` : 'Pre-Approval',
      a.loanAmount?.toString() || '0',
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
        <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
          <button onClick={() => setView('kanban')} className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Kanban</button>
          <button onClick={() => setView('table')} className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${view === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Table</button>
        </div>
        {view === 'table' && (
          <button onClick={exportCSV} className="px-4 py-2.5 text-sm border border-gray-200 hover:border-gray-300 rounded-xl transition-colors cursor-pointer">Export CSV</button>
        )}
      </div>

      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMNS.map(col => {
            const colApps = getAppsForColumn(col);
            return (
              <div key={col.key} className="rounded-xl bg-gray-50 border border-gray-200 p-3 min-h-[400px]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700">{col.label}</h3>
                  <span className="text-[10px] text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200">{colApps.length}</span>
                </div>
                <div className="space-y-2">
                  {colApps.map(app => <KanbanCard key={app.id} app={app} />)}
                  {colApps.length === 0 && <p className="text-xs text-gray-500 text-center py-12">Empty</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'table' && (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['App ID', 'Borrower', 'Vehicle', 'Loan Amount', 'FICO', 'Status', 'Days in Stage', 'Fee'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] text-gray-600 uppercase tracking-wider font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.map(app => {
                  const days = Math.floor((Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs text-gray-500">{app.id}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">{app.borrower.firstName} {app.borrower.lastName.charAt(0)}.</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{app.vehicle ? `${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model}` : 'Pre-Approval'}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">{app.loanAmount ? formatCurrency(app.loanAmount) : 'Pre-Approval'}</td>
                      <td className={`py-4 px-4 font-semibold ${ficoColor(app.credit.ficoScore)}`}>{app.credit.ficoScore ?? 'N/A'}</td>
                      <td className="py-4 px-4"><StatusBadge status={app.status} /></td>
                      <td className="py-4 px-4 text-sm text-gray-600">{days}d</td>
                      <td className="py-4 px-4 text-sm font-medium text-green-600">{app.status === 'funded' ? '$300' : '--'}</td>
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
