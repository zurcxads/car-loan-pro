"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getAllApplications } from '@/lib/store';
import type { Application } from '@/lib/types';

interface LenderConfig { minFico: number; maxLtv: number; maxDti: number; }
type Tab = 'queue' | 'funded' | 'rules';

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = (e: React.FormEvent) => { e.preventDefault(); if (email === 'lender@demo.com' && password === 'demo123') onAuth(); else setError('Invalid credentials. Use lender@demo.com / demo123'); };
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm rounded-2xl surface p-8">
        <Link href="/" className="text-lg font-semibold tracking-tight block mb-8">Car Loan Pro</Link>
        <h2 className="text-lg font-semibold mb-1">Lender Portal</h2>
        <p className="text-xs text-zinc-500 mb-6">Sign in to manage applications</p>
        <form onSubmit={login} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-zinc-900/80 border border-white/10 rounded-xl text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-600/50 transition-colors duration-200" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">Sign In</button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-4 text-center">Demo: lender@demo.com / demo123</p>
      </motion.div>
    </div>
  );
}

export default function LenderPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('queue');
  const [apps, setApps] = useState<Application[]>([]);
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'declined' | 'counter'>>({});
  const [config, setConfig] = useState<LenderConfig>({ minFico: 620, maxLtv: 130, maxDti: 50 });

  useEffect(() => { if (authed) setApps(getAllApplications()); }, [authed]);
  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const decide = (id: string, d: 'approved' | 'declined' | 'counter') => setDecisions(prev => ({ ...prev, [id]: d }));
  const queue = apps.filter(a => a.status === 'submitted' && !decisions[a.id]);
  const funded = apps.filter(a => a.status === 'funded' || decisions[a.id] === 'approved');
  const getInitials = (a: Application) => `${a.personalInfo?.firstName?.[0] || ''}${a.personalInfo?.lastName?.[0] || ''}`.toUpperCase();
  const getFico = (i: number) => [720, 685, 640, 590][i % 4];
  const getLtv = (a: Application) => Math.round((((a.vehicleInfo?.askingPrice || 30000) - (a.dealStructure?.cashDownPayment || 0)) / (a.vehicleInfo?.askingPrice || 30000)) * 100);
  const getDti = (i: number) => [28, 35, 42, 51][i % 4];

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/10 bg-[#09090B]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
            <span className="text-[10px] text-blue-400 bg-blue-600/10 px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">Lender</span>
          </div>
          <button onClick={() => setAuthed(false)} className="text-xs text-zinc-500 hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Sign Out</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 bg-zinc-900/60 rounded-xl p-1 w-fit border border-white/10">
          {([['queue', `Queue (${queue.length})`], ['funded', `Funded (${funded.length})`], ['rules', 'Underwriting Rules']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`px-5 py-2.5 text-xs rounded-lg transition-colors duration-200 cursor-pointer ${tab === key ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-50'}`}>{label}</button>
          ))}
        </div>

        {tab === 'queue' && (
          <div className="space-y-3">
            {queue.length === 0 && <p className="text-sm text-zinc-500 py-16 text-center">No pending applications</p>}
            {queue.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl surface surface-hover p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-semibold flex-shrink-0 text-blue-400">{getInitials(app)}</div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                    <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">FICO</span><span className="font-semibold">{getFico(i)}</span></div>
                    <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Amount</span><span className="font-semibold">${((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)).toLocaleString()}</span></div>
                    <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Vehicle</span><span className="font-semibold">{app.vehicleInfo?.year} {app.vehicleInfo?.make}</span></div>
                    <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">LTV</span><span className="font-semibold">{getLtv(app)}%</span></div>
                    <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">DTI</span><span className="font-semibold">{getDti(i)}%</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decide(app.id, 'approved')} className="px-4 py-2 text-xs bg-green-600 hover:bg-green-500 rounded-lg transition-colors duration-200 cursor-pointer font-medium">Approve</button>
                    <button onClick={() => decide(app.id, 'counter')} className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors duration-200 cursor-pointer font-medium">Counter</button>
                    <button onClick={() => decide(app.id, 'declined')} className="px-4 py-2 text-xs bg-red-600 hover:bg-red-500 rounded-lg transition-colors duration-200 cursor-pointer font-medium">Decline</button>
                  </div>
                </div>
              </motion.div>
            ))}
            {Object.keys(decisions).length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4 font-medium">Recent Decisions</h3>
                {Object.entries(decisions).map(([id, d]) => { const a = apps.find(x => x.id === id); return a ? (
                  <div key={id} className="flex items-center justify-between py-3 text-sm">
                    <span>{a.personalInfo?.firstName} {a.personalInfo?.lastName}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${d === 'approved' ? 'bg-green-500/15 text-green-400' : d === 'declined' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>{d.charAt(0).toUpperCase() + d.slice(1)}</span>
                  </div>) : null; })}
              </div>
            )}
          </div>
        )}

        {tab === 'funded' && (
          <div className="space-y-3">
            {funded.length === 0 && <p className="text-sm text-zinc-500 py-16 text-center">No funded loans yet</p>}
            {funded.map((app) => (
              <div key={app.id} className="rounded-2xl surface p-5 flex items-center gap-5">
                <div className="w-11 h-11 rounded-full bg-green-500/15 flex items-center justify-center text-sm font-semibold text-green-400 flex-shrink-0">{getInitials(app)}</div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Borrower</span>{app.personalInfo?.firstName} {app.personalInfo?.lastName}</div>
                  <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Vehicle</span>{app.vehicleInfo?.year} {app.vehicleInfo?.make} {app.vehicleInfo?.model}</div>
                  <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Funded</span>${((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)).toLocaleString()}</div>
                  <div><span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Revenue</span><span className="text-green-400 font-medium">${(Math.round(((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)) * 0.012)).toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'rules' && (
          <div className="max-w-lg rounded-2xl surface p-8">
            <h2 className="text-sm font-semibold mb-8">Underwriting Rules Configuration</h2>
            <div className="space-y-8">
              {[
                { label: 'Minimum FICO Score', value: config.minFico, min: 300, max: 800, key: 'minFico' as const },
                { label: 'Max LTV %', value: config.maxLtv, min: 80, max: 150, key: 'maxLtv' as const, suffix: '%' },
                { label: 'Max DTI %', value: config.maxDti, min: 20, max: 65, key: 'maxDti' as const, suffix: '%' },
              ].map(item => (
                <div key={item.key}>
                  <div className="flex justify-between text-sm mb-3"><span className="text-zinc-400">{item.label}</span><span className="font-semibold text-blue-400">{item.value}{item.suffix || ''}</span></div>
                  <input type="range" min={item.min} max={item.max} value={item.value} onChange={e => setConfig(c => ({ ...c, [item.key]: Number(e.target.value) }))} className="w-full cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-1.5"><span>{item.min}</span><span>{item.max}</span></div>
                </div>
              ))}
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer mt-4">Save Configuration</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
