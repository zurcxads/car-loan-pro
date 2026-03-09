"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllApplications } from '@/lib/store';
import type { Application } from '@/lib/types';

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'dealer@demo.com' && password === 'demo123') onAuth();
    else setError('Invalid credentials. Use dealer@demo.com / demo123');
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl surface p-8">
        <Link href="/" className="text-lg font-semibold tracking-tight block mb-8">Car Loan Pro</Link>
        <h2 className="text-lg font-semibold mb-1">Dealer Portal</h2>
        <p className="text-xs text-slate-500 mb-6">Access pre-approved buyers</p>
        <form onSubmit={login} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
            className="w-full px-4 py-3 bg-navy-light/80 border border-white/[0.08] rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-purple/50 transition-colors duration-200" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
            className="w-full px-4 py-3 bg-navy-light/80 border border-white/[0.08] rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-purple/50 transition-colors duration-200" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-purple hover:bg-purple-light text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">Sign In</button>
        </form>
        <p className="text-[10px] text-slate-600 mt-4 text-center">Demo: dealer@demo.com / demo123</p>
      </motion.div>
    </div>
  );
}

export default function DealerPage() {
  const [authed, setAuthed] = useState(false);
  const [apps, setApps] = useState<Application[]>([]);
  const [tab, setTab] = useState<'inbox' | 'finalize'>('inbox');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [finalForm, setFinalForm] = useState({ vin: '', finalPrice: '', fees: '' });
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [finalized, setFinalized] = useState<Set<string>>(new Set());

  useEffect(() => { if (authed) setApps(getAllApplications().filter(a => a.status !== 'draft')); }, [authed]);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedApp) {
      setFinalized(prev => new Set(prev).add(selectedApp.id));
      setSelectedApp(null);
      setFinalForm({ vin: '', finalPrice: '', fees: '' });
    }
  };

  const getApprovalAmount = (a: Application) => (a.vehicleInfo?.askingPrice || 0) - (a.dealStructure?.cashDownPayment || 0);
  const getTimeSince = (date?: string) => {
    if (!date) return 'N/A';
    const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000);
    return h < 1 ? 'Just now' : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-navy/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
            <span className="text-[10px] text-purple-light bg-purple/10 px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">Dealer</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-slate-500 hover:text-slate-50 transition-colors duration-200 cursor-pointer">Sign Out</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 bg-navy-light/60 rounded-xl p-1 w-fit border border-white/[0.06]">
          {([['inbox', 'Pre-Approved Buyers'], ['finalize', 'Deal Finalization']] as ['inbox' | 'finalize', string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-xs rounded-lg transition-colors duration-200 cursor-pointer ${tab === key ? 'bg-navy-light text-slate-50' : 'text-slate-500 hover:text-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'inbox' && (
          <div className="space-y-3">
            {apps.length === 0 && <p className="text-sm text-slate-500 py-16 text-center">No pre-approved buyers at this time</p>}
            {apps.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl surface surface-hover p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Approval</span>
                      <span className="font-semibold text-emerald-400">${getApprovalAmount(app).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Rate Range</span>
                      <span className="font-semibold">{(3.49 + i * 0.5).toFixed(2)}% - {(5.99 + i * 0.5).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Vehicle</span>
                      <span className="font-semibold">{app.vehicleInfo?.year} {app.vehicleInfo?.make} {app.vehicleInfo?.model}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Approved</span>
                      <span className="font-semibold">{getTimeSince(app.submittedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {invited.has(app.id) ? (
                      <span className="px-4 py-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20 font-medium">Invited</span>
                    ) : (
                      <button onClick={() => setInvited(prev => new Set(prev).add(app.id))} className="px-4 py-2 text-xs bg-purple hover:bg-purple-light rounded-lg transition-colors duration-200 cursor-pointer font-medium">Invite to Visit</button>
                    )}
                    {finalized.has(app.id) ? (
                      <span className="px-4 py-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20 font-medium">Finalized</span>
                    ) : (
                      <button onClick={() => { setSelectedApp(app); setTab('finalize'); }}
                        className="px-4 py-2 text-xs border border-white/[0.08] hover:border-white/[0.16] rounded-lg transition-colors duration-200 cursor-pointer font-medium">Finalize Deal</button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {tab === 'finalize' && (
          <div className="max-w-lg">
            {selectedApp ? (
              <div className="rounded-2xl surface p-8">
                <h2 className="text-sm font-semibold mb-1">Finalize Deal</h2>
                <p className="text-xs text-slate-500 mb-6">
                  {selectedApp.personalInfo?.firstName} {selectedApp.personalInfo?.lastName} — {selectedApp.vehicleInfo?.year} {selectedApp.vehicleInfo?.make} {selectedApp.vehicleInfo?.model}
                </p>
                <form onSubmit={handleFinalize} className="space-y-5">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium">VIN</label>
                    <input value={finalForm.vin} onChange={e => setFinalForm(f => ({ ...f, vin: e.target.value }))} maxLength={17} placeholder="17-character VIN"
                      className="w-full px-4 py-3 bg-navy-light/80 border border-white/[0.08] rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-purple/50 transition-colors duration-200" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium">Final Purchase Price ($)</label>
                    <input type="number" value={finalForm.finalPrice} onChange={e => setFinalForm(f => ({ ...f, finalPrice: e.target.value }))} placeholder="30000"
                      className="w-full px-4 py-3 bg-navy-light/80 border border-white/[0.08] rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-purple/50 transition-colors duration-200" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 font-medium">Dealer Fees ($)</label>
                    <input type="number" value={finalForm.fees} onChange={e => setFinalForm(f => ({ ...f, fees: e.target.value }))} placeholder="599"
                      className="w-full px-4 py-3 bg-navy-light/80 border border-white/[0.08] rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:border-purple/50 transition-colors duration-200" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setSelectedApp(null)} className="flex-1 px-4 py-3 text-sm border border-white/[0.08] rounded-xl hover:border-white/[0.16] transition-colors duration-200 cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-3 text-sm font-medium bg-purple hover:bg-purple-light rounded-xl transition-colors duration-200 cursor-pointer">Submit Deal</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-16 text-center text-sm text-slate-500">Select a buyer from the inbox to finalize their deal.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
