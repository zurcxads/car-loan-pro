"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllApplications } from '@/lib/store';
import type { Application } from '@/lib/types';

export default function DealerPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [apps, setApps] = useState<Application[]>([]);
  const [tab, setTab] = useState<'inbox' | 'finalize'>('inbox');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [finalForm, setFinalForm] = useState({ vin: '', finalPrice: '', fees: '' });
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [finalized, setFinalized] = useState<Set<string>>(new Set());

  useEffect(() => { if (authed) setApps(getAllApplications().filter(a => a.status !== 'draft')); }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'dealer@demo.com' && password === 'demo123') {
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use dealer@demo.com / demo123');
    }
  };

  const invite = (id: string) => setInvited(prev => new Set(prev).add(id));

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

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <Link href="/" className="text-lg font-semibold tracking-tight block mb-6">Car Loan Pro</Link>
          <h2 className="text-lg font-semibold mb-1">Dealer Portal</h2>
          <p className="text-xs text-zinc-500 mb-5">Access pre-approved buyers</p>
          <form onSubmit={login} className="space-y-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
              className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            {loginError && <p className="text-xs text-red-400">{loginError}</p>}
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors">Sign In</button>
          </form>
          <p className="text-[10px] text-zinc-600 mt-3 text-center">Demo: dealer@demo.com / demo123</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
            <span className="text-xs text-zinc-600 px-2 py-0.5 bg-zinc-800 rounded">Dealer</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-zinc-500 hover:text-white transition-colors">Sign Out</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900/50 rounded-lg p-1 w-fit border border-white/5">
          {([['inbox', 'Pre-Approved Buyers'], ['finalize', 'Deal Finalization']] as ['inbox' | 'finalize', string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 text-xs rounded-md transition-colors ${tab === key ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'inbox' && (
          <div className="space-y-3">
            {apps.length === 0 && <p className="text-sm text-zinc-500 py-10 text-center">No pre-approved buyers at this time</p>}
            {apps.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Approval</span>
                      <span className="font-semibold text-emerald-400">${getApprovalAmount(app).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Rate Range</span>
                      <span className="font-semibold">{(3.49 + i * 0.5).toFixed(2)}% - {(5.99 + i * 0.5).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Vehicle Desired</span>
                      <span className="font-semibold">{app.vehicleInfo?.year} {app.vehicleInfo?.make} {app.vehicleInfo?.model}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Approved</span>
                      <span className="font-semibold">{getTimeSince(app.submittedAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {invited.has(app.id) ? (
                      <span className="px-3 py-1.5 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">Invited</span>
                    ) : (
                      <button onClick={() => invite(app.id)} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Invite to Visit</button>
                    )}
                    {!finalized.has(app.id) && (
                      <button onClick={() => { setSelectedApp(app); setTab('finalize'); }}
                        className="px-3 py-1.5 text-xs border border-white/10 hover:bg-zinc-800 rounded-lg transition-colors">Finalize Deal</button>
                    )}
                    {finalized.has(app.id) && (
                      <span className="px-3 py-1.5 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">Finalized</span>
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
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-sm font-semibold mb-1">Finalize Deal</h2>
                <p className="text-xs text-zinc-500 mb-5">
                  {selectedApp.personalInfo?.firstName} {selectedApp.personalInfo?.lastName} — {selectedApp.vehicleInfo?.year} {selectedApp.vehicleInfo?.make} {selectedApp.vehicleInfo?.model}
                </p>
                <form onSubmit={handleFinalize} className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">VIN</label>
                    <input value={finalForm.vin} onChange={e => setFinalForm(f => ({ ...f, vin: e.target.value }))} maxLength={17} placeholder="17-character VIN"
                      className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Final Purchase Price ($)</label>
                    <input type="number" value={finalForm.finalPrice} onChange={e => setFinalForm(f => ({ ...f, finalPrice: e.target.value }))} placeholder="30000"
                      className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Dealer Fees ($)</label>
                    <input type="number" value={finalForm.fees} onChange={e => setFinalForm(f => ({ ...f, fees: e.target.value }))} placeholder="599"
                      className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setSelectedApp(null)} className="flex-1 px-4 py-2.5 text-sm border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Submit Deal</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-zinc-500">
                Select a buyer from the inbox to finalize their deal.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
