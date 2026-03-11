"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockApplication } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import { computeMonthlyPayment } from '@/lib/underwriting-engine';

type DecisionAction = 'approve' | 'decline' | 'counter' | 'request_docs';

interface Props {
  app: MockApplication;
  action: DecisionAction;
  onClose: () => void;
}

const CONDITION_OPTIONS = [
  'Proof of Income',
  'Proof of Insurance',
  '2 Recent Paystubs',
  'Clear Title',
  'Proof of Residence',
  'Employment Verification',
  'Bank Statements (last 2 months)',
];

const DECLINE_REASONS = [
  'Score below minimum',
  'LTV exceeds maximum',
  'Insufficient income',
  'DTI too high',
  'Employment too short',
  'Policy exclusion',
  'Vehicle too old',
  'Vehicle mileage too high',
  'Other',
];

const DOC_TYPES = [
  'Paystub (last 2)',
  'Bank Statement (last 2 months)',
  'Tax Return (most recent)',
  'Driver License',
  'Proof of Insurance',
  'Proof of Residence',
  'Other',
];

export default function DecisionModal({ app, action, onClose }: Props) {
  // Approve / Counter state
  const [apr, setApr] = useState('5.49');
  const [amount, setAmount] = useState(String(app.loanAmount));
  const [term, setTerm] = useState('60');
  const [conditions, setConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Decline state
  const [declineReason, setDeclineReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [generateAdverse, setGenerateAdverse] = useState(true);

  // Request docs state
  const [requestedDocs, setRequestedDocs] = useState<string[]>([]);
  const [docMessage, setDocMessage] = useState(`Hi ${app.borrower.firstName}, we need some additional documents to complete your application review. Please upload the following at your earliest convenience.`);

  const monthlyPayment = computeMonthlyPayment(Number(amount), Number(apr), Number(term));

  const toggleCondition = (c: string) => {
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const toggleDoc = (d: string) => {
    setRequestedDocs(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm px-6">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {action === 'approve' ? 'Offer Sent' : action === 'decline' ? 'Application Declined' : action === 'counter' ? 'Counter Offer Sent' : 'Document Request Sent'}
          </h3>
          <p className="text-sm text-gray-500">
            {action === 'approve' ? `Offer sent to ${app.borrower.firstName} ${app.borrower.lastName}` : action === 'decline' ? 'Adverse action notice will be generated' : action === 'counter' ? 'Counter offer sent to borrower' : 'Document request sent via email'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm px-6 overflow-y-auto py-10">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-8 max-w-lg w-full"
        >
          {/* APPROVE / COUNTER */}
          {(action === 'approve' || action === 'counter') && (
            <>
              <h3 className="text-lg font-semibold mb-1">{action === 'approve' ? 'Build Offer' : 'Counter Offer'} -- {app.id}</h3>
              {action === 'counter' && (
                <p className="text-xs text-gray-500 mb-4">Original request: {formatCurrency(app.loanAmount)} at {app.dealStructure.requestedTerm} months</p>
              )}
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">APR (%)</label>
                  <input type="number" step="0.01" value={apr} onChange={e => setApr(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Approved Amount ($)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Term</label>
                  <select value={term} onChange={e => setTerm(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50">
                    {[36, 48, 60, 72, 84].map(t => <option key={t} value={t}>{t} months</option>)}
                  </select>
                </div>

                {/* Live computed payment */}
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Est. Monthly Payment</span>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(monthlyPayment)}</div>
                </div>

                {/* Conditions */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-medium">Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {CONDITION_OPTIONS.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleCondition(c)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                          conditions.includes(c) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customCondition}
                    onChange={e => setCustomCondition(e.target.value)}
                    placeholder="Add custom condition..."
                    className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 px-4 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer text-gray-900">Send Offer to Borrower</button>
              </div>
            </>
          )}

          {/* DECLINE */}
          {action === 'decline' && (
            <>
              <h3 className="text-lg font-semibold mb-4">Decline Application -- {app.id}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Decline Reason</label>
                  <select value={declineReason} onChange={e => setDeclineReason(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50">
                    <option value="">Select reason...</option>
                    {DECLINE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Internal Notes (optional)</label>
                  <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50 resize-none" placeholder="Not shown to borrower..." />
                </div>
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setGenerateAdverse(!generateAdverse)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${generateAdverse ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                    {generateAdverse && <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-xs text-gray-500">Generate ECOA Adverse Action Notice</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSubmit} disabled={!declineReason} className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${declineReason ? 'bg-red-600 hover:bg-red-500 text-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Confirm Decline</button>
              </div>
            </>
          )}

          {/* REQUEST DOCS */}
          {action === 'request_docs' && (
            <>
              <h3 className="text-lg font-semibold mb-4">Request Documents -- {app.id}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 font-medium">Select Documents</label>
                  <div className="space-y-2">
                    {DOC_TYPES.map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDoc(d)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${requestedDocs.includes(d) ? 'bg-blue-600 border-blue-600' : 'border-gray-200'}`}>
                          {requestedDocs.includes(d) && <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-sm text-gray-700">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Message to Borrower</label>
                  <textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSubmit} disabled={requestedDocs.length === 0} className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors cursor-pointer ${requestedDocs.length > 0 ? 'bg-blue-600 hover:bg-blue-500 text-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Send Request</button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
