"use client";

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { MockApplication } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import { computeMonthlyPayment } from '@/lib/underwriting-engine';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { DocumentRequestType } from '@/lib/types';

type DecisionAction = 'approve' | 'decline' | 'counter' | 'request_docs';

interface Props {
  app: MockApplication;
  action: DecisionAction;
  onClose: () => void;
  onSubmitted?: () => void;
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

const DOC_TYPES: { label: string; value: DocumentRequestType }[] = [
  { label: 'Pay Stub', value: 'pay_stub' },
  { label: 'ID', value: 'drivers_license' },
  { label: 'Bank Statement', value: 'bank_statement' },
  { label: 'Proof of Insurance', value: 'proof_of_insurance' },
  { label: 'Proof of Residence', value: 'proof_of_residence' },
  { label: 'Other', value: 'other' },
];

const DEADLINE_OPTIONS = [
  { label: '7 days', value: '7' },
  { label: '14 days', value: '14' },
  { label: '30 days', value: '30' },
] as const;

function buildDeadline(daysFromNow: string) {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + Number(daysFromNow));
  return deadline.toISOString();
}

export default function DecisionModal({ app, action, onClose, onSubmitted }: Props) {
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
  const [requestedDocs, setRequestedDocs] = useState<DocumentRequestType[]>([]);
  const [deadlineDays, setDeadlineDays] = useState<(typeof DEADLINE_OPTIONS)[number]['value']>('14');
  const [requestNotes, setRequestNotes] = useState(`Please upload the selected documents so we can complete your application review.`);
  const [submitting, setSubmitting] = useState(false);

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

  const toggleDoc = (d: DocumentRequestType) => {
    setRequestedDocs(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleSubmit = async () => {
    if (action === 'request_docs') {
      if (requestedDocs.length === 0) {
        return;
      }

      setSubmitting(true);

      try {
        const response = await fetch('/api/lender/document-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: app.id,
            docTypes: requestedDocs,
            deadline: buildDeadline(deadlineDays),
            notes: requestNotes.trim() || undefined,
          }),
        });

        const payload = await response.json() as
          | { success: true }
          | { success: false; error?: string };

        if (!response.ok || !payload.success) {
          toast.error(payload.success ? 'Unable to send document request.' : payload.error || 'Unable to send document request.');
          return;
        }

        onSubmitted?.();
      } catch {
        toast.error('Unable to send document request.');
        return;
      } finally {
        setSubmitting(false);
      }
    }

    setSubmitted(true);
    setTimeout(() => {
      onSubmitted?.();
      onClose();
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-6 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Check className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-[#0A2540]">
            {action === 'approve' ? 'Offer Sent' : action === 'decline' ? 'Application Declined' : action === 'counter' ? 'Counter Offer Sent' : 'Document Request Sent'}
          </h3>
          <p className="text-sm text-[#6B7C93]">
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
          className="w-full max-w-lg rounded-2xl border border-[#E3E8EE] bg-white p-8"
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
              <h3 className="mb-1 text-lg font-semibold text-[#0A2540]">Request Documents -- {app.id}</h3>
              <p className="mb-4 text-sm text-[#6B7C93]">Select the items this consumer must upload and set a due date.</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#6B7C93]">Select Documents</label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {DOC_TYPES.map((documentType) => (
                      <button
                        key={documentType.value}
                        type="button"
                        onClick={() => toggleDoc(documentType.value)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                          requestedDocs.includes(documentType.value)
                            ? 'border-blue-600 bg-blue-50 text-[#0A2540]'
                            : 'border-[#E3E8EE] bg-white text-[#425466] hover:border-blue-600/40'
                        }`}
                      >
                        <span>{documentType.label}</span>
                        <div className={`flex h-5 w-5 items-center justify-center rounded border ${requestedDocs.includes(documentType.value) ? 'border-blue-600 bg-blue-600' : 'border-[#E3E8EE]'}`}>
                          {requestedDocs.includes(documentType.value) ? <Check className="h-3.5 w-3.5 text-white" /> : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-[#6B7C93]">Deadline</label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {DEADLINE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDeadlineDays(option.value)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                          deadlineDays === option.value
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-[#E3E8EE] text-[#425466] hover:border-blue-600/40'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-[#6B7C93]">Notes to Consumer</label>
                  <textarea
                    value={requestNotes}
                    onChange={e => setRequestNotes(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-[#E3E8EE] px-4 py-3 text-sm text-[#0A2540] transition-colors hover:bg-[#F6F9FC]">Cancel</button>
                <button onClick={() => void handleSubmit()} disabled={requestedDocs.length === 0 || submitting} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${requestedDocs.length > 0 && !submitting ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-500' : 'cursor-not-allowed bg-[#E3E8EE] text-[#6B7C93]'}`}>{submitting ? 'Sending...' : 'Send Request'}</button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
