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
  switch (status) {
    case 'draft': return 0;
    case 'submitted': return 2;
    case 'decisioned': return 3;
    case 'funded': return 5;
    default: return 2;
  }
}

export default function StatusPage() {
  const [app, setApp] = useState<Application | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);

  useEffect(() => { setApp(getApplication()); }, []);

  const activeStep = getActiveStep(app?.status);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploaded(prev => [...prev, ...files.map(f => f.name)]);
  };

  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
          <Link href="/offers" className="text-xs text-zinc-400 hover:text-white transition-colors">View Offers</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Application Status</h1>

        {/* Pipeline */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6">
          <div className="relative">
            {PIPELINE.map((step, i) => (
              <div key={step.key} className="flex gap-4 mb-0 last:mb-0">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: i <= activeStep ? 1 : 0.8 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                      i < activeStep ? 'bg-emerald-500 border-emerald-500' :
                      i === activeStep ? 'bg-blue-600 border-blue-600' :
                      'bg-zinc-800 border-zinc-700'
                    }`}>
                    {i < activeStep ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    )}
                  </motion.div>
                  {i < PIPELINE.length - 1 && (
                    <div className={`w-0.5 h-10 ${i < activeStep ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                  )}
                </div>
                <div className="pt-1 pb-6">
                  <div className={`text-sm font-medium ${i <= activeStep ? 'text-white' : 'text-zinc-600'}`}>{step.label}</div>
                  {i === activeStep && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-zinc-400 mt-1">
                      {step.desc}
                    </motion.p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        {app && (
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-semibold mb-4">Application Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Applicant</span>
                <div className="font-medium">{app.personalInfo?.firstName} {app.personalInfo?.lastName}</div>
              </div>
              <div>
                <span className="text-zinc-500">Application ID</span>
                <div className="font-medium font-mono text-xs">{app.id}</div>
              </div>
              <div>
                <span className="text-zinc-500">Vehicle</span>
                <div className="font-medium">{app.vehicleInfo?.year} {app.vehicleInfo?.make} {app.vehicleInfo?.model}</div>
              </div>
              <div>
                <span className="text-zinc-500">Loan Amount</span>
                <div className="font-medium">${((app.vehicleInfo?.askingPrice || 0) - (app.dealStructure?.cashDownPayment || 0)).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-zinc-500">Submitted</span>
                <div className="font-medium">{app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'Not yet'}</div>
              </div>
              <div>
                <span className="text-zinc-500">Status</span>
                <div className="font-medium capitalize">{app.status}</div>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold mb-4">Document Upload</h2>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-white/10'}`}>
            <svg className="w-8 h-8 mx-auto mb-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="text-sm text-zinc-400">Drag and drop documents here</p>
            <p className="text-xs text-zinc-600 mt-1">Pay stubs, ID, bank statements, etc.</p>
          </div>
          {uploaded.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploaded.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400 px-3 py-2 bg-zinc-800/50 rounded-lg">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-sm rounded-lg border border-white/10 transition-colors">
            Download Approval Letter
          </button>
          <Link href="/offers" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors">
            View Offers
          </Link>
        </div>

        {!app && (
          <div className="py-20 text-center">
            <p className="text-zinc-500 mb-4">No application found. Start by applying.</p>
            <Link href="/apply" className="inline-flex px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">Apply Now</Link>
          </div>
        )}
      </div>
    </div>
  );
}
