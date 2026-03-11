"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { MOCK_APPLICATIONS, getOffersForApplication, type MockOffer, type MockApplication } from '@/lib/mock-data';
import { formatCurrency, formatAPR, formatDate, daysUntil } from '@/lib/format-utils';
import OfferCard from '@/components/offers/OfferCard';
import ComparisonTable from '@/components/offers/ComparisonTable';
import DocumentUploadCenter from '@/components/status/DocumentUploadCenter';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const PIPELINE = [
  { key: 'submitted', label: 'Submitted', desc: 'Your application has been received.' },
  { key: 'reviewing', label: 'Under Review', desc: 'Lenders are reviewing your profile.' },
  { key: 'offers_ready', label: 'Offers Ready', desc: 'Pre-qualification offers are available.' },
  { key: 'accepted', label: 'Accepted', desc: 'You\'ve selected an offer. Finalizing...' },
];

const lenderTiers: Record<string, string> = {
  'Ally Financial': 'near_prime',
  'Capital One Auto': 'prime',
  'Chase Auto': 'prime',
  'Westlake Financial': 'subprime',
  'Prestige Financial': 'subprime',
  'TD Auto Finance': 'near_prime',
  'Bank of America': 'prime',
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const { user } = useAuth();

  const [app, setApp] = useState<MockApplication | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<MockOffer | null>(null);
  const [activeStep, setActiveStep] = useState(2);
  const [selectingOffer, setSelectingOffer] = useState<MockOffer | null>(null);

  useEffect(() => {
    const savedOffer = localStorage.getItem('clp_selected_offer');
    if (savedOffer) {
      setSelectedOffer(JSON.parse(savedOffer));
      setActiveStep(3);
    }

    const appId = localStorage.getItem('clp_current_app_id');
    if (appId) {
      fetch(`/api/applications/${appId}`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data) setApp(json.data);
          else setApp(MOCK_APPLICATIONS[0]);
        })
        .catch(() => setApp(MOCK_APPLICATIONS[0]));
    } else {
      setApp(MOCK_APPLICATIONS[0]);
    }
  }, []);

  const appId = app?.id || 'APP-001';
  const offers: MockOffer[] = useMemo(() => {
    return getOffersForApplication(appId).length > 0 ? getOffersForApplication(appId) : getOffersForApplication('APP-001');
  }, [appId]);

  const handleSelectOffer = (offer: MockOffer) => {
    localStorage.setItem('clp_selected_offer', JSON.stringify(offer));
    setSelectedOffer(offer);
    setSelectingOffer(null);
    setActiveStep(3);
    toast.success(`Offer from ${offer.lenderName} selected!`);
  };

  return (
    <DashboardLayout activeTab={tab}>
      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* Welcome */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
            <p className="text-sm text-gray-500 mt-1">Here&apos;s the status of your auto loan application.</p>
          </motion.div>

          {/* Status Tracker */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-6">Application Progress</h2>
            <div className="flex items-center gap-0">
              {PIPELINE.map((step, i) => (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors duration-300 ${
                    i < activeStep ? 'bg-green-500 border-green-500' :
                    i === activeStep ? 'bg-blue-600 border-blue-600' :
                    'bg-gray-100 border-gray-300'
                  }`}>
                    {i < activeStep ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className={`text-xs font-semibold ${i === activeStep ? 'text-white' : 'text-gray-400'}`}>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${i <= activeStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{step.label}</span>
                  {i < PIPELINE.length - 1 && (
                    <div className={`absolute top-4 left-[calc(50%+18px)] right-[calc(-50%+18px)] h-0.5 ${i < activeStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Key Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Offers Available</div>
              <div className="text-2xl font-bold text-gray-900">{offers.length}</div>
            </motion.div>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Best Rate</div>
              <div className="text-2xl font-bold text-blue-600">{offers.length > 0 ? formatAPR(Math.min(...offers.map(o => o.apr))) : 'N/A'}</div>
            </motion.div>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Loan Amount</div>
              <div className="text-2xl font-bold text-gray-900">{app ? formatCurrency(app.loanAmount) : '—'}</div>
            </motion.div>
          </div>

          {/* Selected Offer */}
          {selectedOffer && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-6">Selected Offer</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Lender</span>
                  <span className="font-semibold text-gray-900">{selectedOffer.lenderName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">APR</span>
                  <span className="font-semibold text-blue-600">{formatAPR(selectedOffer.apr)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Term</span>
                  <span className="font-semibold text-gray-900">{selectedOffer.termMonths} mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Monthly</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(selectedOffer.monthlyPayment)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Expires</span>
                  <span className="font-semibold text-gray-900">{daysUntil(selectedOffer.expiresAt)} days</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Application Details */}
          {app && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-6">Application Details</h2>
              <div className="grid sm:grid-cols-2 gap-6 text-sm">
                <div><span className="text-gray-500 text-xs uppercase tracking-wider">Applicant</span><div className="font-medium text-gray-900 mt-1">{app.borrower.firstName} {app.borrower.lastName}</div></div>
                <div><span className="text-gray-500 text-xs uppercase tracking-wider">Application ID</span><div className="font-medium font-mono text-xs text-gray-900 mt-1">{app.id}</div></div>
                <div><span className="text-gray-500 text-xs uppercase tracking-wider">Vehicle</span><div className="font-medium text-gray-900 mt-1">{app.vehicle.year} {app.vehicle.make} {app.vehicle.model}</div></div>
                <div><span className="text-gray-500 text-xs uppercase tracking-wider">Submitted</span><div className="font-medium text-gray-900 mt-1">{formatDate(app.submittedAt)}</div></div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* OFFERS TAB */}
      {tab === 'offers' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Offers</h1>
            <p className="text-sm text-gray-500 mt-1">{offers.length} pre-qualification offers from competing lenders</p>
          </div>

          <div className="space-y-4">
            {offers.sort((a, b) => a.apr - b.apr).map((offer, i) => (
              <motion.div key={offer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <OfferCard
                  offer={offer}
                  isLowestRate={offer.apr === Math.min(...offers.map(o => o.apr))}
                  lenderTier={lenderTiers[offer.lenderName] || 'prime'}
                  onSelect={setSelectingOffer}
                />
              </motion.div>
            ))}
          </div>

          {offers.length > 1 && <ComparisonTable offers={offers.sort((a, b) => a.apr - b.apr)} />}

          {offers.length === 0 && (
            <div className="py-24 text-center rounded-2xl bg-white border border-gray-200">
              <p className="text-gray-500 mb-6">No offers yet. Your application is being reviewed.</p>
            </div>
          )}

          {/* Simple confirmation inline instead of full modal for simplicity */}
          {selectingOffer && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectingOffer(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Accept This Offer?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  By selecting this offer from <strong>{selectingOffer.lenderName}</strong>, you consent to a hard credit inquiry by the lender. This may impact your credit score.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">APR</span><span className="font-medium text-blue-600">{formatAPR(selectingOffer.apr)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Term</span><span className="font-medium">{selectingOffer.termMonths} months</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Monthly</span><span className="font-medium">{formatCurrency(selectingOffer.monthlyPayment)}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectingOffer(null)} className="flex-1 py-3 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={() => handleSelectOffer(selectingOffer)} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">Accept Offer</button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {tab === 'documents' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">Upload required documents for your loan application.</p>
          </div>

          {selectedOffer ? (
            <DocumentUploadCenter
              conditions={selectedOffer.conditions}
              appId={appId}
              onAllUploaded={() => toast.success('All conditions met!')}
            />
          ) : (
            <div className="py-24 text-center rounded-2xl bg-white border border-gray-200">
              <p className="text-gray-500">Select an offer first to see required documents.</p>
              <Link href="/dashboard?tab=offers" className="mt-4 inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
                View Offers
              </Link>
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === 'profile' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Your account information.</p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 max-w-lg">
            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Name</label>
                <div className="text-sm font-medium text-gray-900 mt-1">{user?.name || '—'}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                <div className="text-sm font-medium text-gray-900 mt-1">{user?.email || '—'}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">User ID</label>
                <div className="text-xs font-mono text-gray-500 mt-1">{user?.id || '—'}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Account Type</label>
                <div className="text-sm font-medium text-gray-900 mt-1 capitalize">{user?.role || 'consumer'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
