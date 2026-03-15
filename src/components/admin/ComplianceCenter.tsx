"use client";

import { useEffect, useState } from 'react';
import { MOCK_ADVERSE_ACTIONS, MOCK_FCRA_LOG } from '@/lib/mock-data';
import { formatDate, formatDateTime, daysUntil } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';

type SubTab = 'adverse' | 'fcra' | 'ecoa';

export default function ComplianceCenter() {
  const [subTab, setSubTab] = useState<SubTab>('adverse');
  const [adverseActions, setAdverseActions] = useState(MOCK_ADVERSE_ACTIONS.map(a => ({ ...a, status: a.status as string })));
  const [fcraLog, setFcraLog] = useState(MOCK_FCRA_LOG);
  const [pullTypeFilter, setPullTypeFilter] = useState('all');

  useEffect(() => {
    let mounted = true;

    async function loadComplianceData() {
      try {
        const response = await fetch('/api/admin/compliance');
        const json = (await response.json()) as {
          success?: boolean;
          data?: {
            adverseActions?: typeof MOCK_ADVERSE_ACTIONS;
            fcraLog?: typeof MOCK_FCRA_LOG;
          };
        };

        if (mounted && json.success && json.data) {
          setAdverseActions((json.data.adverseActions ?? MOCK_ADVERSE_ACTIONS).map((action) => ({ ...action, status: action.status as string })));
          setFcraLog(json.data.fcraLog ?? MOCK_FCRA_LOG);
        }
      } catch {}
    }

    void loadComplianceData();

    return () => {
      mounted = false;
    };
  }, []);

  const markSent = (id: string) => {
    setAdverseActions(prev => prev.map(a => a.id === id ? { ...a, status: 'sent' as const } : a));
  };

  const exportCSV = () => {
    const headers = ['Log ID', 'Borrower', 'Pull Type', 'Bureau', 'Date/Time', 'Purpose', 'Consent', 'App ID', 'Requested By'];
    const rows = fcraLog.map(l => [l.id, l.borrowerName, l.pullType, l.bureau, l.dateTime, l.purpose, l.consentOnFile ? 'Y' : 'N', l.applicationId, l.requestedBy]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fcra_audit_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFCRA = pullTypeFilter === 'all' ? fcraLog : fcraLog.filter(l => l.pullType === pullTypeFilter);

  return (
    <div>
      <div className="flex gap-1 mb-8 bg-gray-50 rounded-xl p-1 w-fit border border-gray-200">
        {([['adverse', 'Adverse Action Queue'], ['fcra', 'FCRA Audit Log'], ['ecoa', 'ECOA Monitoring']] as [SubTab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setSubTab(key)} className={`px-4 py-2 text-xs rounded-lg transition-colors cursor-pointer ${subTab === key ? 'bg-white border border-gray-200 shadow-sm text-gray-900' : 'text-gray-500'}`}>{label}</button>
        ))}
      </div>

      {subTab === 'adverse' && (
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold">Adverse Action Notice Queue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {['App ID', 'Borrower', 'Decline Date', 'Deadline (30d)', 'Status', 'Lender', 'Reason', 'Action'].map(h => (
                    <th key={h} className="text-left py-4 px-5 text-[10px] text-gray-500 uppercase tracking-widest font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adverseActions.map(aa => {
                  const daysLeft = daysUntil(aa.deadline);
                  const isOverdue = daysLeft < 0;
                  return (
                    <tr key={aa.id} className={`border-b border-gray-200 ${isOverdue ? 'bg-red-50' : ''}`}>
                      <td className="py-4 px-5 font-mono text-xs text-gray-500">{aa.applicationId}</td>
                      <td className="py-4 px-5 font-medium">{aa.borrowerName}</td>
                      <td className="py-4 px-5 text-gray-500">{formatDate(aa.declineDate)}</td>
                      <td className="py-4 px-5">
                        <span className={isOverdue ? 'text-red-500' : daysLeft < 7 ? 'text-amber-600' : 'text-gray-700'}>
                          {formatDate(aa.deadline)} ({isOverdue ? 'OVERDUE' : `${daysLeft}d left`})
                        </span>
                      </td>
                      <td className="py-4 px-5"><StatusBadge status={aa.status} /></td>
                      <td className="py-4 px-5 text-gray-500">{aa.lenderName}</td>
                      <td className="py-4 px-5 text-gray-700">{aa.reasonCode}</td>
                      <td className="py-4 px-5">
                        {aa.status === 'pending' ? (
                          <button onClick={() => markSent(aa.id)} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-gray-900 rounded-lg transition-colors cursor-pointer">Send Notice</button>
                        ) : (
                          <span className="text-xs text-green-600">Sent</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'fcra' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {['all', 'Soft', 'Hard'].map(t => (
                <button key={t} onClick={() => setPullTypeFilter(t)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${pullTypeFilter === t ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                  {t === 'all' ? 'All' : `${t} Pull`}
                </button>
              ))}
            </div>
            <button onClick={exportCSV} className="px-4 py-2 text-xs border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer">Export CSV</button>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Log ID', 'Borrower', 'Pull Type', 'Bureau', 'Date/Time', 'Purpose', 'Consent', 'App ID', 'Requested By'].map(h => (
                      <th key={h} className="text-left py-4 px-4 text-[10px] text-gray-500 uppercase tracking-widest font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFCRA.map(log => (
                    <tr key={log.id} className="border-b border-gray-200">
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{log.id}</td>
                      <td className="py-3 px-4">{log.borrowerName}</td>
                      <td className="py-3 px-4"><span className={`text-[10px] px-2 py-0.5 rounded-full ${log.pullType === 'Hard' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>{log.pullType}</span></td>
                      <td className="py-3 px-4 text-gray-500">{log.bureau}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">{formatDateTime(log.dateTime)}</td>
                      <td className="py-3 px-4 text-gray-700">{log.purpose}</td>
                      <td className="py-3 px-4"><span className={log.consentOnFile ? 'text-green-600' : 'text-red-500'}>{log.consentOnFile ? 'Y' : 'N'}</span></td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{log.applicationId}</td>
                      <td className="py-3 px-4 text-gray-500">{log.requestedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'ecoa' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
            <h3 className="text-sm font-semibold mb-4">ECOA Disparate Impact Analysis</h3>
            <div className="py-12 text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p className="text-sm text-gray-500">ECOA disparate impact analysis requires 12 months of data.</p>
              <p className="text-xs text-gray-500 mt-1">Full reporting available after launch.</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
            <h3 className="text-sm font-semibold mb-4">Manual Compliance Flags</h3>
            <p className="text-xs text-gray-500 mb-4">Applications flagged for manual compliance review</p>
            <div className="text-xs text-gray-500 text-center py-8">No flagged applications at this time.</div>
          </div>
        </div>
      )}
    </div>
  );
}
