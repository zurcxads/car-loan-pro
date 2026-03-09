"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllApplications } from '@/lib/store';
import type { Application } from '@/lib/types';

interface LenderConfig {
  minFico: number;
  maxLtv: number;
  maxDti: number;
}

type Tab = 'queue' | 'funded' | 'rules';

export default function LenderPage() {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('queue');
  const [apps, setApps] = useState<Application[]>([]);
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'declined' | 'counter'>>({});
  const [config, setConfig] = useState<LenderConfig>({ minFico: 620, maxLtv: 130, maxDti: 50 });

  useEffect(() => { if (authed) setApps(getAllApplications()); }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'lender@demo.com' && password === 'demo123') {
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use lender@demo.com / demo123');
    }
  };

  const decide = (id: string, decision: 'approved' | 'declined' | 'counter') => {
    setDecisions(d => ({ ...d, [id]: decision }));
  };

  const queue = apps.filter(a => a.status === 'submitted' && !decisions[a.id]);
  const funded = apps.filter(a => a.status === 'funded' || decisions[a.id] === 'approved');

  const getInitials = (a: Application) => `${a.personalInfo?.firstName?.[0] || ''}${a.personalInfo?.lastName?.[0] || ''}`.toUpperCase();
  const getFico = (i: number) => [720, 685, 640, 590][i % 4];
  const getLtv = (a: Application) => {
    const price = a.vehicleInfo?.askingPrice || 30000;
    const down = a.dealStructure?.cashDownPayment || 0;
    return Math.round(((price - down) / price) * 100);
  };
  const getDti = (i: number) => [28, 35, 42, 51][i % 4];

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <Link href="/" className="text-lg font-semibold tracking-tight block mb-6">Car Loan Pro</Link>
          <h2 className="text-lg font-semibold mb-1">Lender Portal</h2>
          <p className="text-xs text-zinc-500 mb-5">Sign in to manage applications</p>
          <form onSubmit={login} className="space-y-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
              className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
              className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            {loginError && <p className="text-xs text-red-400">{loginError}</p>}
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors">Sign In</button>
          </form>
          <p className="text-[10px] text-zinc-600 mt-3 text-center">Demo: lender@demo.com / demo123</p>
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
            <span className="text-xs text-zinc-600 px-2 py-0.5 bg-zinc-800 rounded">Lender</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-zinc-500 hover:text-white transition-colors">Sign Out</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900/50 rounded-lg p-1 w-fit border border-white/5">
          {([['queue', `Queue (${queue.length})`], ['funded', `Funded (${funded.length})`], ['rules', 'Underwriting Rules']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 text-xs rounded-md transition-colors ${tab === key ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'queue' && (
          <div className="space-y-3">
            {queue.length === 0 && <p className="text-sm text-zinc-500 py-10 text-center">No pending applications</p>}
            {queue.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {getInitials(app)}
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                    <div><span className="text-[10px] text-zinc-500 block">FICO</span><span className="font-semibold">{getFico(i)}</span></div>
                    <div><span className="text-[10px] text-zinc-500 block">Amount</span><span className="font-semibold">${((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)).toLocaleString()}</span></div>
                    <div><span className="text-[10px] text-zinc-500 block">Vehicle</span><span className="font-semibold">{app.vehicleInfo?.year} {app.vehicleInfo?.make}</span></div>
                    <div><span className="text-[10px] text-zinc-500 block">LTV</span><span className="font-semibold">{getLtv(app)}%</span></div>
                    <div><span className="text-[10px] text-zinc-500 block">DTI</span><span className="font-semibold">{getDti(i)}%</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decide(app.id, 'approved')} className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">Approve</button>
                    <button onClick={() => decide(app.id, 'counter')} className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors">Counter</button>
                    <button onClick={() => decide(app.id, 'declined')} className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 rounded-lg transition-colors">Decline</button>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Show recent decisions */}
            {Object.keys(decisions).length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Recent Decisions</h3>
                {Object.entries(decisions).map(([id, d]) => {
                  const a = apps.find(x => x.id === id);
                  return a ? (
                    <div key={id} className="flex items-center justify-between py-2 text-sm">
                      <span>{a.personalInfo?.firstName} {a.personalInfo?.lastName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : d === 'declined' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'funded' && (
          <div className="space-y-3">
            {funded.length === 0 && <p className="text-sm text-zinc-500 py-10 text-center">No funded loans yet</p>}
            {funded.map((app) => (
              <div key={app.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm font-semibold text-emerald-400 flex-shrink-0">
                  {getInitials(app)}
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-[10px] text-zinc-500 block">Borrower</span>{app.personalInfo?.firstName} {app.personalInfo?.lastName}</div>
                  <div><span className="text-[10px] text-zinc-500 block">Vehicle</span>{app.vehicleInfo?.year} {app.vehicleInfo?.make} {app.vehicleInfo?.model}</div>
                  <div><span className="text-[10px] text-zinc-500 block">Funded</span>${((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)).toLocaleString()}</div>
                  <div><span className="text-[10px] text-zinc-500 block">Revenue</span><span className="text-emerald-400">${(Math.round(((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)) * 0.012)).toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'rules' && (
          <div className="max-w-lg bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-semibold mb-6">Underwriting Rules Configuration</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Minimum FICO Score</span>
                  <span className="font-semibold">{config.minFico}</span>
                </div>
                <input type="range" min={300} max={800} value={config.minFico} onChange={e => setConfig(c => ({ ...c, minFico: Number(e.target.value) }))} className="w-full" />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1"><span>300</span><span>800</span></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Max LTV %</span>
                  <span className="font-semibold">{config.maxLtv}%</span>
                </div>
                <input type="range" min={80} max={150} value={config.maxLtv} onChange={e => setConfig(c => ({ ...c, maxLtv: Number(e.target.value) }))} className="w-full" />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1"><span>80%</span><span>150%</span></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Max DTI %</span>
                  <span className="font-semibold">{config.maxDti}%</span>
                </div>
                <input type="range" min={20} max={65} value={config.maxDti} onChange={e => setConfig(c => ({ ...c, maxDti: Number(e.target.value) }))} className="w-full" />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1"><span>20%</span><span>65%</span></div>
              </div>
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors mt-2">Save Configuration</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
