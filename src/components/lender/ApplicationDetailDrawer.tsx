"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { MockApplication, MOCK_OFFERS } from '@/lib/mock-data';
import { formatCurrency, formatAPR, ficoColor, ltvColor, dtiColor, ptiColor } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';

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
      <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, className = '' }: { label: string; value: string | number | null | undefined; className?: string }) {
  return (
    <div>
      <span className="text-[10px] text-zinc-600 block">{label}</span>
      <span className={`text-sm font-medium ${className}`}>{value ?? 'N/A'}</span>
    </div>
  );
}

export default function ApplicationDetailDrawer({ app, onClose, onApprove, onDecline, onCounter, onRequestDocs }: Props) {
  const offers = MOCK_OFFERS.filter(o => o.applicationId === app.id);
  const lender = { maxLtv: 120, maxDti: 48, minFico: 620 }; // Demo lender params

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[560px] bg-[#0c0c0e] border-l border-white/10 overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0c0c0e] border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-zinc-400">{app.id}</span>
              <StatusBadge status={app.status} />
            </div>
            <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-50 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6">
            {/* Borrower */}
            <Section title="Borrower Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" value={`${app.borrower.firstName} ${app.borrower.lastName}`} />
                <Field label="DOB" value={app.borrower.dob.split('-')[0] + '-XX-XX'} />
                <Field label="SSN" value={app.borrower.ssn} />
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
            <Section title="Vehicle">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Vehicle" value={`${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model} ${app.vehicle.trim}`} />
                <Field label="VIN" value={app.vehicle.vin} />
                <Field label="Mileage" value={`${app.vehicle.mileage.toLocaleString()} mi`} />
                <Field label="Condition" value={app.vehicle.condition} />
                <Field label="Asking Price" value={formatCurrency(app.vehicle.askingPrice)} />
                <Field label="Book Value" value={formatCurrency(app.vehicle.bookValue)} />
                <Field label="Dealer" value={app.vehicle.dealerName} />
              </div>
            </Section>

            {/* Deal Structure */}
            <Section title="Deal Structure">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sale Price" value={formatCurrency(app.dealStructure.salePrice)} />
                <Field label="Down Payment" value={formatCurrency(app.dealStructure.downPayment)} />
                <Field label="Trade-In" value={app.dealStructure.tradeInValue ? formatCurrency(app.dealStructure.tradeInValue) : 'None'} />
                <Field label="Doc Fee" value={formatCurrency(app.dealStructure.docFee)} />
                <Field label="Tax/Fees" value={formatCurrency(app.dealStructure.taxAndFees)} />
                <Field label="Amount Financed" value={formatCurrency(app.dealStructure.totalAmountFinanced)} />
                <Field label="Requested Term" value={`${app.dealStructure.requestedTerm} months`} />
              </div>
            </Section>

            {/* Underwriting */}
            <Section title="Computed Underwriting">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-600 block">LTV (max {lender.maxLtv}%)</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${ltvColor(app.ltvPercent)}`}>{app.ltvPercent}%</span>
                    {app.ltvPercent <= lender.maxLtv ? (
                      <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">PASS</span>
                    ) : (
                      <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">FAIL</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-600 block">DTI (max {lender.maxDti}%)</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${dtiColor(app.dtiPercent)}`}>{app.dtiPercent}%</span>
                    {app.dtiPercent <= lender.maxDti ? (
                      <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">PASS</span>
                    ) : (
                      <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">FAIL</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-600 block">PTI</span>
                  <span className={`text-sm font-semibold ${ptiColor(app.ptiPercent)}`}>{app.ptiPercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-600 block">FICO (min {lender.minFico})</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${ficoColor(app.credit.ficoScore)}`}>{app.credit.ficoScore ?? 'N/A'}</span>
                    {(app.credit.ficoScore === null || app.credit.ficoScore >= lender.minFico) ? (
                      <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">PASS</span>
                    ) : (
                      <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">FAIL</span>
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
                <Field label="Derogatory Marks" value={app.credit.derogatoryMarks} className={app.credit.derogatoryMarks > 0 ? 'text-amber-400' : ''} />
                <Field label="Repo History" value={app.credit.hasRepo ? 'Yes' : 'No'} className={app.credit.hasRepo ? 'text-red-400' : ''} />
                <Field label="Bankruptcy" value={app.credit.hasBankruptcy ? 'Yes' : 'No'} className={app.credit.hasBankruptcy ? 'text-red-400' : ''} />
              </div>
            </Section>

            {/* Existing offers */}
            {offers.length > 0 && (
              <Section title="Existing Offers">
                <div className="space-y-2">
                  {offers.map(o => (
                    <div key={o.id} className="rounded-xl bg-zinc-800/50 p-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{o.lenderName}</span>
                        <span className="text-zinc-500 ml-2">{formatAPR(o.apr)} / {o.termMonths}mo</span>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Footer actions */}
          <div className="sticky bottom-0 bg-[#0c0c0e] border-t border-white/10 px-6 py-4 flex gap-2">
            <button onClick={onDecline} className="px-4 py-2.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors duration-200 cursor-pointer font-medium">
              Decline
            </button>
            <button onClick={onRequestDocs} className="px-4 py-2.5 text-xs border border-white/10 hover:border-white/20 rounded-xl transition-colors duration-200 cursor-pointer font-medium">
              Request Docs
            </button>
            <button onClick={onCounter} className="px-4 py-2.5 text-xs border border-white/10 hover:border-white/20 rounded-xl transition-colors duration-200 cursor-pointer font-medium">
              Counter
            </button>
            <button onClick={onApprove} className="flex-1 px-4 py-2.5 text-xs bg-green-600 hover:bg-green-500 rounded-xl transition-colors duration-200 cursor-pointer font-medium">
              Approve
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
