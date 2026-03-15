"use client";

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { MockApplication } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import { computeMonthlyPayment } from '@/lib/underwriting-engine';
import { useFocusTrap } from '@/hooks/useFocusTrap';

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
  const dialogRef = useRef<HTMLDivElement>(null);
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
  const title =
    action === 'approve'
      ? `Build Offer -- ${app.id}`
      : action === 'decline'
        ? `Decline Application -- ${app.id}`
        : action === 'counter'
          ? `Counter Offer -- ${app.id}`
          : `Request Documents -- ${app.id}`;

  useFocusTrap(!submitted, dialogRef, onClose);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-6 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Check className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-white/60 px-6 py-10 backdrop-blur-sm">
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="decision-modal-title"
          tabIndex={-1}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8"
        >
          <h2 id="decision-modal-title" className="sr-only">{title}</h2>
          {/* APPROVE / COUNTER */}
          {(action === 'approve' || action === 'counter') && (
            <>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">{action === 'approve' ? 'Build Offer' : 'Counter Offer'} -- {app.id}</h3>
              {action === 'counter' && (
                <p className="mb-4 text-xs text-gray-500">Original request: {app.loanAmount ? formatCurrency(app.loanAmount) : 'Pre-Approval'} at {app.dealStructure.requestedTerm} months</p>
              )}
              <div className="space-y-4 mt-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">APR (%)</label>
                  <input type="number" step="0.01" value={apr} onChange={e => setApr(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Approved Amount ($)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Term</label>
                  <select value={term} onChange={e => setTerm(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50">
                    {[36, 48, 60, 72, 84].map(t => <option key={t} value={t}>{t} months</option>)}
                  </select>
                </div>

                {/* Live computed payment */}
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Est. Monthly Payment</span>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(monthlyPayment)}</div>
                </div>

                {/* Conditions */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-500">Conditions</label>
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
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">Send Offer to Borrower</button>
              </div>
            </>
          )}

          {/* DECLINE */}
          {action === 'decline' && (
            <>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Decline Application -- {app.id}</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Decline Reason</label>
                  <select value={declineReason} onChange={e => setDeclineReason(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50">
                    <option value="">Select reason...</option>
                    {DECLINE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Internal Notes (optional)</label>
                  <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50" placeholder="Not shown to borrower..." />
                </div>
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setGenerateAdverse(!generateAdverse)}>
                  <div className={`flex h-4 w-4 items-center justify-center rounded border ${generateAdverse ? 'border-blue-600 bg-blue-600' : 'border-gray-200'}`}>
                    {generateAdverse && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-xs text-gray-500">Generate ECOA Adverse Action Notice</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit} disabled={!declineReason} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${declineReason ? 'cursor-pointer bg-red-600 text-white hover:bg-red-500' : 'cursor-not-allowed bg-gray-200 text-gray-500'}`}>Confirm Decline</button>
              </div>
            </>
          )}

          {/* REQUEST DOCS */}
          {action === 'request_docs' && (
            <>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Request Documents -- {app.id}</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-500">Select Documents</label>
                  <div className="space-y-2">
                    {DOC_TYPES.map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleDoc(d)}>
                        <div className={`flex h-4 w-4 items-center justify-center rounded border ${requestedDocs.includes(d) ? 'border-blue-600 bg-blue-600' : 'border-gray-200'}`}>
                          {requestedDocs.includes(d) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm text-gray-700">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Message to Borrower</label>
                  <textarea value={docMessage} onChange={e => setDocMessage(e.target.value)} rows={4} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmit} disabled={requestedDocs.length === 0} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${requestedDocs.length > 0 ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-500' : 'cursor-not-allowed bg-gray-200 text-gray-500'}`}>Send Request</button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
