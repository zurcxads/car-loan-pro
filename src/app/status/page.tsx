"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getApplication } from '@/lib/store';
import type { Application } from '@/lib/types';

const PIPELINE = [
  { key: 'received', label: 'Application Received', desc: 'Your application has been submitted and is being processed.' },
  { key: 'reviewed', label: 'Credit Reviewed', desc: 'A soft credit inquiry has been completed to match you with lenders.' },
  { key: 'offers', label: 'Offers Available', desc: 'Lenders have reviewed your application and provided pre-qualification offers.' },
  { key: 'selected', label: 'Offer Selected', desc: 'You have selected an offer. The lender will begin final underwriting.' },
  { key: 'conditions', label: 'Conditions Met', desc: 'All required documents have been submitted and verified.' },
  { key: 'funded', label: 'Funded', desc: 'Your loan has been funded. Congratulations!' },
];

function getActiveStep(status?: string): number {
  switch (status) { case 'draft': return 0; case 'submitted': return 2; case 'decisioned': return 3; case 'funded': return 5; default: return 2; }
}

export default function StatusPage() {
  const [app, setApp] = useState<Application | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  useEffect(() => { setApp(getApplication()); }, []);
  const activeStep = getActiveStep(app?.status);

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/10 bg-[#09090B]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
          <Link href="/offers" className="text-xs text-zinc-400 hover:text-zinc-50 transition-colors duration-200 cursor-pointer">View Offers</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">Application Status</h1>

        <div className="rounded-2xl surface p-8 mb-8">
          {PIPELINE.map((step, i) => (
            <div key={step.key} className="flex gap-5">
              <div className="flex flex-col items-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: i <= activeStep ? 1 : 0.8, opacity: 1 }} transition={{ delay: i * 0.08 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors duration-300 ${i < activeStep ? 'bg-green-500 border-green-500' : i === activeStep ? 'bg-blue-600 border-blue-600' : 'bg-zinc-800 border-zinc-700'}`}>
                  {i < activeStep ? <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> : <span className="text-xs font-semibold">{i + 1}</span>}
                </motion.div>
                {i < PIPELINE.length - 1 && <div className={`w-0.5 h-12 ${i < activeStep ? 'bg-green-500' : 'bg-zinc-800'}`} />}
              </div>
              <div className="pt-1.5 pb-8">
                <div className={`text-sm font-medium ${i <= activeStep ? 'text-zinc-50' : 'text-zinc-600'}`}>{step.label}</div>
                {i === activeStep && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{step.desc}</motion.p>}
              </div>
            </div>
          ))}
        </div>

        {app && (
          <div className="rounded-2xl surface p-8 mb-8">
            <h2 className="text-sm font-semibold mb-6">Application Details</h2>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div><span className="text-zinc-500 text-xs uppercase tracking-wider">Applicant</span><div className="font-medium mt-1">{app.personalInfo?.firstName} {app.personalInfo?.lastName}</div></div>
              <div><span className="text-zinc-500 text-xs uppercase tracking-wider">Application ID</span><div className="font-medium font-mono text-xs mt-1">{app.id}</div></div>
              <div><span className="text-zinc-500 text-xs uppercase tracking-wider">Vehicle</span><div className="font-medium mt-1">{app.vehicleInfo?.year} {app.vehicleInfo?.make} {app.vehicleInfo?.model}</div></div>
              <div><span className="text-zinc-500 text-xs uppercase tracking-wider">Loan Amount</span><div className="font-medium mt-1">${((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)).toLocaleString()}</div></div>
              <div><span className="text-zinc-500 text-xs uppercase tracking-wider">Submitted</span><div className="font-medium mt-1">{app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'Not yet'}</div></div>
              <div><span className="text-zinc-500 text-xs uppercase tracking-wider">Status</span><div className="font-medium mt-1 capitalize">{app.status}</div></div>
            </div>
          </div>
        )}

        <div className="rounded-2xl surface p-8 mb-8">
          <h2 className="text-sm font-semibold mb-6">Document Upload</h2>
          <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); setUploaded(prev => [...prev, ...Array.from(e.dataTransfer.files).map(f => f.name)]); }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors duration-200 cursor-pointer ${dragOver ? 'border-blue-600/50 bg-blue-600/[0.03]' : 'border-white/10'}`}>
            <svg className="w-8 h-8 mx-auto mb-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="text-sm text-zinc-400">Drag and drop documents here</p>
            <p className="text-xs text-zinc-600 mt-1.5">Pay stubs, ID, bank statements, etc.</p>
          </div>
          {uploaded.length > 0 && (
            <div className="mt-5 space-y-2">
              {uploaded.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-400 px-4 py-3 bg-zinc-800/60 rounded-xl">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button className="px-6 py-3 text-sm border border-white/10 hover:border-white/20 rounded-xl transition-colors duration-200 cursor-pointer">Download Approval Letter</button>
          <Link href="/offers" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">View Offers</Link>
        </div>

        {!app && (
          <div className="py-24 text-center">
            <p className="text-zinc-500 mb-6">No application found. Start by applying.</p>
            <Link href="/apply" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">Apply Now</Link>
          </div>
        )}
      </div>
    </div>
  );
}
