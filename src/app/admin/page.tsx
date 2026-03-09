"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllApplications } from '@/lib/store';
import { SAMPLE_LENDERS } from '@/lib/constants';
import type { Application } from '@/lib/types';

type Tab = 'overview' | 'applications' | 'lenders' | 'compliance' | 'revenue';

const complianceLogs = [
  { ts: '2026-03-09 03:42:00', event: 'Credit pull initiated', user: 'system', detail: 'Soft inquiry for app sample_1 via TransUnion' },
  { ts: '2026-03-09 03:42:01', event: 'FCRA consent recorded', user: 'Maria Garcia', detail: 'E-Sign consent captured, IP: 72.14.xxx.xxx' },
  { ts: '2026-03-09 02:18:00', event: 'Offer generated', user: 'system', detail: 'Capital One Auto — 4.49% APR, 60mo, $28,500' },
  { ts: '2026-03-08 22:05:00', event: 'Application submitted', user: 'James Wilson', detail: 'App sample_2, 2023 Honda Civic, $30,000' },
  { ts: '2026-03-08 20:30:00', event: 'Data export requested', user: 'admin', detail: 'CSV export of all applications — 4 records' },
  { ts: '2026-03-08 18:12:00', event: 'Lender status changed', user: 'admin', detail: 'Credit Acceptance Corp set to inactive' },
  { ts: '2026-03-07 14:22:00', event: 'Rate lock expired', user: 'system', detail: 'Offer exp_002 for James Wilson expired after 14 days' },
  { ts: '2026-03-07 09:15:00', event: 'Dealer invitation sent', user: 'dealer@demo.com', detail: 'Invitation sent to Sarah Chen for dealership visit' },
];

const monthlyRevenue = [
  { month: 'Oct 2025', loans: 42, revenue: 12600 },
  { month: 'Nov 2025', loans: 51, revenue: 15300 },
  { month: 'Dec 2025', loans: 38, revenue: 11400 },
  { month: 'Jan 2026', loans: 55, revenue: 16500 },
  { month: 'Feb 2026', loans: 63, revenue: 18900 },
  { month: 'Mar 2026', loans: 28, revenue: 8400 },
];

const tierBadge: Record<string, string> = {
  prime: 'bg-green-500/15 text-green-400 border-green-500/25',
  near_prime: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  subprime: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  specialty: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
};

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const login = (e: React.FormEvent) => { e.preventDefault(); if (user === 'admin@clp' && pass === 'admin2026') onAuth(); else setError('Invalid credentials. Use admin@clp / admin2026'); };
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl surface p-8">
        <Link href="/" className="text-lg font-semibold tracking-tight block mb-8">Car Loan Pro</Link>
        <h2 className="text-lg font-semibold mb-1">Admin Panel</h2>
        <p className="text-xs text-zinc-500 mb-6">Restricted access</p>
        <form onSubmit={login} className="space-y-4">
          <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="Username" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">Sign In</button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-4 text-center">Demo: admin@clp / admin2026</p>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');
  const [apps, setApps] = useState<Application[]>([]);
  const [lenderActive, setLenderActive] = useState<Record<string, boolean>>({});

  useEffect(() => { if (authed) { setApps(getAllApplications()); const a: Record<string, boolean> = {}; SAMPLE_LENDERS.forEach(l => { a[l.id] = true; }); setLenderActive(a); } }, [authed]);
  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const funded = apps.filter(a => a.status === 'funded').length;
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const convRate = apps.length > 0 ? Math.round((funded / apps.length) * 100) : 0;
  const maxRev = Math.max(...monthlyRevenue.map(m => m.revenue));

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/10 bg-[#09090B]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
            <span className="text-[10px] text-red-400 px-2.5 py-1 bg-red-500/10 rounded-full border border-red-500/20 font-medium uppercase tracking-wider">Admin</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-zinc-500 hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Sign Out</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 bg-zinc-900/60 rounded-xl p-1 w-fit border border-white/10 overflow-x-auto">
          {([['overview', 'Overview'], ['applications', 'Applications'], ['lenders', 'Lenders'], ['compliance', 'Compliance'], ['revenue', 'Revenue']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-5 py-2.5 text-xs rounded-lg transition-colors duration-200 cursor-pointer whitespace-nowrap ${tab === key ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-50'}`}>{label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Applications', value: String(apps.length), color: 'text-blue-400' },
                { label: 'Funded Loans', value: String(funded), color: 'text-green-400' },
                { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-zinc-50' },
                { label: 'Conversion Rate', value: `${convRate}%`, color: 'text-blue-400' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl surface p-6">
                  <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-widest font-medium">{stat.label}</div>
                  <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                </motion.div>
              ))}
            </div>
            <div className="rounded-2xl surface p-8">
              <h3 className="text-sm font-semibold mb-6">Monthly Revenue</h3>
              <div className="flex items-end gap-3 h-36">
                {monthlyRevenue.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-[10px] text-zinc-500 font-medium">${(m.revenue / 1000).toFixed(1)}k</div>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(m.revenue / maxRev) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="w-full bg-blue-600 rounded-t min-h-[4px]" />
                    <div className="text-[9px] text-zinc-600 truncate w-full text-center font-medium">{m.month.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'applications' && (
          <div className="rounded-2xl surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10">
                  {['ID', 'Applicant', 'Vehicle', 'Amount', 'Status', 'Date'].map(h => <th key={h} className="text-left py-4 px-5 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{h}</th>)}
                </tr></thead>
                <tbody>
                  {apps.map(app => (
                    <tr key={app.id} className="border-b border-white/[0.04] hover:bg-zinc-800/30 transition-colors duration-150">
                      <td className="py-4 px-5 font-mono text-xs text-zinc-500">{app.id.slice(0, 10)}</td>
                      <td className="py-4 px-5 font-medium">{app.personalInfo?.firstName} {app.personalInfo?.lastName}</td>
                      <td className="py-4 px-5 text-zinc-400">{app.vehicleInfo?.year} {app.vehicleInfo?.make} {app.vehicleInfo?.model}</td>
                      <td className="py-4 px-5">${((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)).toLocaleString()}</td>
                      <td className="py-4 px-5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                          app.status === 'funded' ? 'bg-green-500/15 text-green-400' :
                          app.status === 'submitted' ? 'bg-blue-500/15 text-blue-400' :
                          app.status === 'decisioned' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-zinc-700/50 text-zinc-400'}`}>{app.status}</span>
                      </td>
                      <td className="py-4 px-5 text-zinc-500 text-xs">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'lenders' && (
          <div className="space-y-3">
            {SAMPLE_LENDERS.map(lender => (
              <div key={lender.id} className="rounded-2xl surface surface-hover p-5 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-medium">{lender.name}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${tierBadge[lender.tier]}`}>{lender.tier.replace('_', '-')}</span>
                  </div>
                  <div className="flex gap-5 text-xs text-zinc-500"><span>Min FICO: {lender.minFico || 'None'}</span><span>Base APR: {lender.apr}%</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${lenderActive[lender.id] ? 'bg-blue-600' : 'bg-zinc-700'}`}
                    onClick={() => setLenderActive(la => ({ ...la, [lender.id]: !la[lender.id] }))}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${lenderActive[lender.id] ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-xs text-zinc-400 w-14">{lenderActive[lender.id] ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'compliance' && (
          <div className="rounded-2xl surface overflow-hidden">
            <div className="p-6 border-b border-white/10"><h3 className="text-sm font-semibold">Compliance Audit Trail</h3></div>
            <div className="divide-y divide-white/[0.04]">
              {complianceLogs.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2 text-sm hover:bg-zinc-800/20 transition-colors duration-150">
                  <span className="text-[10px] text-zinc-600 font-mono w-36 flex-shrink-0">{log.ts}</span>
                  <span className="font-medium w-48 flex-shrink-0">{log.event}</span>
                  <span className="text-xs text-zinc-500 w-32 flex-shrink-0">{log.user}</span>
                  <span className="text-xs text-zinc-400 flex-1">{log.detail}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {tab === 'revenue' && (
          <div className="space-y-6">
            <div className="rounded-2xl surface p-8">
              <h3 className="text-sm font-semibold mb-6">Revenue by Lender</h3>
              <div className="space-y-4">
                {SAMPLE_LENDERS.filter(l => l.tier !== 'subprime' || l.id === 'l5').slice(0, 6).map((lender, i) => {
                  const rev = [8400, 7200, 5100, 4800, 3600, 2400][i];
                  return (
                    <div key={lender.id} className="flex items-center gap-4">
                      <span className="text-xs text-zinc-400 w-44 truncate">{lender.name}</span>
                      <div className="flex-1 h-6 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(rev / 8400) * 100}%` }} transition={{ delay: i * 0.1, duration: 0.6 }}
                          className="h-full bg-blue-600 rounded-full" />
                      </div>
                      <span className="text-xs font-semibold w-16 text-right">${rev.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl surface overflow-hidden">
              <div className="p-6 border-b border-white/10"><h3 className="text-sm font-semibold">Monthly Breakdown</h3></div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/10">
                  {['Month', 'Funded Loans', 'Revenue', 'Avg Per Loan'].map(h => <th key={h} className="text-left py-4 px-6 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">{h}</th>)}
                </tr></thead>
                <tbody>
                  {monthlyRevenue.map((m, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-4 px-6">{m.month}</td>
                      <td className="py-4 px-6 text-zinc-400">{m.loans}</td>
                      <td className="py-4 px-6 font-semibold text-green-400">${m.revenue.toLocaleString()}</td>
                      <td className="py-4 px-6 text-zinc-400">${Math.round(m.revenue / m.loans)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
