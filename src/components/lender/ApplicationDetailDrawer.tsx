"use client";

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockApplication, MOCK_OFFERS } from '@/lib/mock-data';
import { formatCurrency, formatAPR, ficoColor, ltvColor, dtiColor, ptiColor } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Props {
  app: MockApplication;
  onClose: () => void;
  onApprove: () => void;
  onDecline: () => void;
  onCounter: () => void;
  onRequestDocs: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, className = '' }: { label: string; value: string | number | null | undefined; className?: string }) {
  return (
    <div>
      <span className="text-[10px] text-gray-400 block">{label}</span>
      <span className={`text-sm font-medium ${className}`}>{value ?? 'N/A'}</span>
    </div>
  );
}

export default function ApplicationDetailDrawer({ app, onClose, onApprove, onDecline, onCounter, onRequestDocs }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const offers = MOCK_OFFERS.filter(o => o.applicationId === app.id);
  const lender = { maxLtv: 120, maxDti: 48, minFico: 620 }; // Demo lender params

  useFocusTrap(true, drawerRef, onClose);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/50"
          onClick={onClose}
        />
        <motion.div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-detail-title"
          tabIndex={-1}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[560px] bg-white border-l border-gray-200 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 id="application-detail-title" className="font-mono text-sm text-gray-500">{app.id}</h2>
              <StatusBadge status={app.status} />
            </div>
            <button onClick={onClose} aria-label="Close application details" className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6">
            {/* Borrower */}
            <Section title="Borrower Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" value={`${app.borrower.firstName} ${app.borrower.lastName}`} />
                <Field label="DOB" value={app.borrower.dob.split('-')[0] + '-XX-XX'} />
                <Field label="SSN" value={`***-**-${app.borrower.ssn.slice(-4)}`} />
                <Field label="Phone" value={app.borrower.phone} />
                <Field label="Email" value={app.borrower.email} />
                <Field label="Address" value={`${app.borrower.city}, ${app.borrower.state} ${app.borrower.zip}`} />
                <Field label="Months at Address" value={app.borrower.monthsAtAddress} />
                <Field label="Residence Type" value={app.borrower.residenceType} />
                <Field label="Housing Payment" value={formatCurrency(app.borrower.monthlyHousingPayment)} />
              </div>
            </Section>

            {/* Employment */}
            <Section title="Employment & Income">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Employer" value={app.employment.employer} />
                <Field label="Title" value={app.employment.title} />
                <Field label="Status" value={app.employment.status.replace(/_/g, ' ')} />
                <Field label="Months Employed" value={app.employment.monthsAtEmployer} />
                <Field label="Gross Monthly" value={formatCurrency(app.employment.grossMonthlyIncome)} />
                <Field label="Income Type" value={app.employment.incomeType.replace(/_/g, ' ')} />
              </div>
            </Section>

            {/* Vehicle */}
            {app.vehicle ? (
              <Section title="Vehicle">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Vehicle" value={`${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model} ${app.vehicle.trim || ''}`} />
                  <Field label="VIN" value={app.vehicle.vin || 'N/A'} />
                  <Field label="Mileage" value={`${app.vehicle.mileage?.toLocaleString() || 0} mi`} />
                  <Field label="Condition" value={app.vehicle.condition || 'N/A'} />
                  <Field label="Asking Price" value={formatCurrency(app.vehicle.askingPrice || 0)} />
                  <Field label="Book Value" value={formatCurrency(app.vehicle.bookValue || 0)} />
                  <Field label="Dealer" value={app.vehicle.dealerName || 'N/A'} />
                </div>
              </Section>
            ) : (
              <Section title="Pre-Approval">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    This is an income-based pre-approval. No vehicle has been selected yet.
                  </p>
                </div>
              </Section>
            )}

            {/* Deal Structure */}
            <Section title="Deal Structure">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sale Price" value={app.dealStructure.salePrice ? formatCurrency(app.dealStructure.salePrice) : 'N/A'} />
                <Field label="Down Payment" value={app.dealStructure.downPayment ? formatCurrency(app.dealStructure.downPayment) : '$0'} />
                <Field label="Trade-In" value={app.dealStructure.tradeInValue ? formatCurrency(app.dealStructure.tradeInValue) : 'None'} />
                <Field label="Doc Fee" value={app.dealStructure.docFee ? formatCurrency(app.dealStructure.docFee) : 'N/A'} />
                <Field label="Tax/Fees" value={app.dealStructure.taxAndFees ? formatCurrency(app.dealStructure.taxAndFees) : 'N/A'} />
                <Field label="Amount Financed" value={app.dealStructure.totalAmountFinanced ? formatCurrency(app.dealStructure.totalAmountFinanced) : 'N/A'} />
                <Field label="Requested Term" value={`${app.dealStructure.requestedTerm} months`} />
              </div>
            </Section>

            {/* Underwriting */}
            <Section title="Computed Underwriting">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-gray-400 block">LTV (max {lender.maxLtv}%)</span>
                  <div className="flex items-center gap-2">
                    {app.ltvPercent ? (
                      <>
                        <span className={`text-sm font-semibold ${ltvColor(app.ltvPercent)}`}>{app.ltvPercent}%</span>
                        {app.ltvPercent <= lender.maxLtv ? (
                          <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">PASS</span>
                        ) : (
                          <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">FAIL</span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">N/A (No vehicle)</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">DTI (max {lender.maxDti}%)</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${dtiColor(app.dtiPercent)}`}>{app.dtiPercent}%</span>
                    {app.dtiPercent <= lender.maxDti ? (
                      <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">PASS</span>
                    ) : (
                      <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">FAIL</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">PTI</span>
                  <span className={`text-sm font-semibold ${ptiColor(app.ptiPercent || 0)}`}>{app.ptiPercent ?? 'N/A'}{app.ptiPercent ? '%' : ''}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">FICO (min {lender.minFico})</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${ficoColor(app.credit.ficoScore)}`}>{app.credit.ficoScore ?? 'N/A'}</span>
                    {(app.credit.ficoScore === null || app.credit.ficoScore >= lender.minFico) ? (
                      <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">PASS</span>
                    ) : (
                      <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded">FAIL</span>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Credit Summary */}
            <Section title="Credit Summary">
              <div className="grid grid-cols-2 gap-4">
                <Field label="FICO Score" value={app.credit.ficoScore ?? 'N/A'} className={ficoColor(app.credit.ficoScore)} />
                <Field label="Score Tier" value={app.credit.scoreTier} />
                <Field label="Monthly Obligations" value={formatCurrency(app.credit.totalMonthlyObligations)} />
                <Field label="Open Auto Tradelines" value={app.credit.openAutoTradelines} />
                <Field label="Derogatory Marks" value={app.credit.derogatoryMarks} className={app.credit.derogatoryMarks > 0 ? 'text-amber-600' : ''} />
                <Field label="Repo History" value={app.credit.hasRepo ? 'Yes' : 'No'} className={app.credit.hasRepo ? 'text-red-500' : ''} />
                <Field label="Bankruptcy" value={app.credit.hasBankruptcy ? 'Yes' : 'No'} className={app.credit.hasBankruptcy ? 'text-red-500' : ''} />
              </div>
            </Section>

            {/* Existing offers */}
            {offers.length > 0 && (
              <Section title="Existing Offers">
                <div className="space-y-2">
                  {offers.map(o => (
                    <div key={o.id} className="rounded-xl bg-gray-50 p-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{o.lenderName}</span>
                        <span className="text-gray-500 ml-2">{formatAPR(o.apr)} / {o.termMonths}mo</span>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Footer actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-2">
            <button onClick={onDecline} className="px-4 py-2.5 text-xs border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200 cursor-pointer font-medium">
              Decline
            </button>
            <button onClick={onRequestDocs} className="px-4 py-2.5 text-xs border border-gray-200 hover:border-gray-200 rounded-xl transition-colors duration-200 cursor-pointer font-medium">
              Request Docs
            </button>
            <button onClick={onCounter} className="px-4 py-2.5 text-xs border border-gray-200 hover:border-gray-200 rounded-xl transition-colors duration-200 cursor-pointer font-medium">
              Counter
            </button>
            <button onClick={onApprove} className="flex-1 px-4 py-2.5 text-xs bg-green-600 hover:bg-green-500 rounded-xl transition-colors duration-200 cursor-pointer font-medium text-gray-900">
              Approve
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
