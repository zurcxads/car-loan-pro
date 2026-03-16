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
  lenderId: string;
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

export default function DecisionModal({ app, action, lenderId, onClose, onSubmitted }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [apr, setApr] = useState('5.49');
  const [amount, setAmount] = useState(String(app.loanAmount ?? app.dealStructure.totalAmountFinanced ?? 0));
  const [term, setTerm] = useState(String(app.dealStructure.requestedTerm));
  const [conditions, setConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [requestedDocs, setRequestedDocs] = useState<DocumentRequestType[]>([]);
  const [deadlineDays, setDeadlineDays] = useState<(typeof DEADLINE_OPTIONS)[number]['value']>('14');
  const [requestNotes, setRequestNotes] = useState('Please upload the selected documents so we can complete your application review.');
  const [submitting, setSubmitting] = useState(false);

  const monthlyPayment = computeMonthlyPayment(Number(amount), Number(apr), Number(term));
  const title =
    action === 'approve'
      ? `Approve Application -- ${app.id}`
      : action === 'decline'
        ? `Decline Application -- ${app.id}`
        : action === 'counter'
          ? `Counter Offer -- ${app.id}`
          : `Request Documents -- ${app.id}`;

  useFocusTrap(!submitted, dialogRef, onClose);

  const toggleCondition = (condition: string) => {
    setConditions((currentConditions) =>
      currentConditions.includes(condition)
        ? currentConditions.filter((currentCondition) => currentCondition !== condition)
        : [...currentConditions, condition]
    );
  };

  const toggleDoc = (documentType: DocumentRequestType) => {
    setRequestedDocs((currentDocs) =>
      currentDocs.includes(documentType)
        ? currentDocs.filter((currentDoc) => currentDoc !== documentType)
        : [...currentDocs, documentType]
    );
  };

  const finishSubmission = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmitted?.();
      onClose();
    }, 900);
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (action === 'decline' && !declineReason) {
      return;
    }

    if (action === 'request_docs' && requestedDocs.length === 0) {
      return;
    }

    if (action === 'counter' && (!Number(amount) || !Number(apr) || !Number(term))) {
      toast.error('Enter valid counter-offer terms.');
      return;
    }

    setSubmitting(true);

    try {
      if (action === 'approve') {
        const response = await fetch(`/api/lender/applications/${encodeURIComponent(app.id)}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lenderId,
            notes: approvalNotes.trim() || undefined,
          }),
        });
        const payload = await response.json() as { success?: boolean };
        if (!response.ok || !payload.success) {
          toast.error('Unable to approve application.');
          return;
        }
        toast.success('Application approved.');
        finishSubmission();
        return;
      }

      if (action === 'decline') {
        const reason = internalNotes.trim()
          ? `${declineReason}${declineReason.endsWith('.') ? '' : '.'} ${internalNotes.trim()}`
          : declineReason;
        const response = await fetch(`/api/lender/applications/${encodeURIComponent(app.id)}/decline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lenderId,
            reason,
          }),
        });
        const payload = await response.json() as { success?: boolean };
        if (!response.ok || !payload.success) {
          toast.error('Unable to decline application.');
          return;
        }
        toast.success('Application declined.');
        finishSubmission();
        return;
      }

      if (action === 'counter') {
        const nextConditions = customCondition.trim()
          ? Array.from(new Set([...conditions, customCondition.trim()]))
          : conditions;
        const response = await fetch(`/api/lender/applications/${encodeURIComponent(app.id)}/counter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Number(amount),
            apr: Number(apr),
            conditions: nextConditions,
            lenderId,
            monthlyPayment,
            term: Number(term),
          }),
        });
        const payload = await response.json() as { success?: boolean };
        if (!response.ok || !payload.success) {
          toast.error('Unable to create counter offer.');
          return;
        }
        toast.success('Counter offer created.');
        finishSubmission();
        return;
      }

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
      const payload = await response.json() as { success?: boolean };
      if (!response.ok || !payload.success) {
        toast.error('Unable to send document request.');
        return;
      }
      toast.success('Document request sent.');
      finishSubmission();
    } catch {
      toast.error(
        action === 'approve'
          ? 'Unable to approve application.'
          : action === 'decline'
            ? 'Unable to decline application.'
            : action === 'counter'
              ? 'Unable to create counter offer.'
              : 'Unable to send document request.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-6 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Check className="h-7 w-7 text-blue-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-[#0A2540]">
            {action === 'approve' ? 'Application Approved' : action === 'decline' ? 'Application Declined' : action === 'counter' ? 'Counter Offer Created' : 'Document Request Sent'}
          </h3>
          <p className="text-sm text-[#6B7C93]">
            {action === 'approve' ? 'The borrower record has been updated.' : action === 'decline' ? 'The decline has been recorded.' : action === 'counter' ? 'The new offer terms are now active.' : 'The consumer has been asked for documents.'}
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
          {(action === 'approve' || action === 'counter') && (
            <>
              <h3 className="mb-1 text-lg font-semibold text-gray-900">{action === 'approve' ? 'Approve Application' : 'Counter Offer'} -- {app.id}</h3>
              {action === 'approve' ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                    Confirm approval for {app.borrower.firstName} {app.borrower.lastName}. This will mark the application approved and update the active offer.
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500">Notes (optional)</label>
                    <textarea
                      value={approvalNotes}
                      onChange={(event) => setApprovalNotes(event.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50"
                      placeholder="Add internal approval notes"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-xs text-gray-500">Original request: {app.loanAmount ? formatCurrency(app.loanAmount) : 'Pre-Approval'} at {app.dealStructure.requestedTerm} months</p>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">APR (%)</label>
                      <input type="number" step="0.01" value={apr} onChange={(event) => setApr(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">Approved Amount ($)</label>
                      <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">Term</label>
                      <select value={term} onChange={(event) => setTerm(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50">
                        {[36, 48, 60, 72, 84].map((termOption) => <option key={termOption} value={termOption}>{termOption} months</option>)}
                      </select>
                    </div>
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">Est. Monthly Payment</span>
                      <div className="mt-1 text-2xl font-bold text-blue-600">{formatCurrency(monthlyPayment)}</div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-500">Conditions</label>
                      <div className="flex flex-wrap gap-2">
                        {CONDITION_OPTIONS.map((condition) => (
                          <button
                            key={condition}
                            type="button"
                            onClick={() => toggleCondition(condition)}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                              conditions.includes(condition) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-500'
                            }`}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={customCondition}
                        onChange={(event) => setCustomCondition(event.target.value)}
                        placeholder="Add custom condition..."
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="mt-6 flex gap-3">
                <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors hover:bg-gray-50">Cancel</button>
                <button onClick={() => void handleSubmit()} disabled={submitting} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white transition-colors ${submitting ? 'cursor-not-allowed bg-blue-300' : 'cursor-pointer bg-blue-600 hover:bg-blue-500'}`}>{submitting ? 'Saving...' : action === 'approve' ? 'Confirm Approval' : 'Create Counter Offer'}</button>
              </div>
            </>
          )}

          {action === 'decline' && (
            <>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Decline Application -- {app.id}</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Decline Reason</label>
                  <select value={declineReason} onChange={(event) => setDeclineReason(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600/50">
                    <option value="">Select reason...</option>
                    {DECLINE_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Notes (optional)</label>
                  <textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-600/50" placeholder="Add supporting context for the decline" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors hover:bg-gray-50">Cancel</button>
                <button onClick={() => void handleSubmit()} disabled={!declineReason || submitting} className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${declineReason && !submitting ? 'cursor-pointer bg-red-600 text-white hover:bg-red-500' : 'cursor-not-allowed bg-gray-200 text-gray-500'}`}>{submitting ? 'Saving...' : 'Confirm Decline'}</button>
              </div>
            </>
          )}

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
                    onChange={(event) => setRequestNotes(event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
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
