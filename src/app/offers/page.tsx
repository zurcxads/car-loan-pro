"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getOffers, getCreditProfile, saveOffers, generateCreditProfile, saveCreditProfile } from '@/lib/store';
import type { LenderOffer, CreditPullResult } from '@/lib/types';

const tierColors: Record<string, string> = {
  prime: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  near_prime: 'bg-gold/15 text-gold border-gold/25',
  subprime: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  specialty: 'bg-purple/15 text-purple-light border-purple/25',
};

const tierLabels: Record<string, string> = {
  prime: 'Prime', near_prime: 'Near-Prime', subprime: 'Subprime', specialty: 'Specialty',
};

type SortKey = 'rate' | 'payment' | 'term';

function CheckIcon() {
  return <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<LenderOffer[]>([]);
  const [credit, setCredit] = useState<CreditPullResult | null>(null);
  const [sort, setSort] = useState<SortKey>('rate');
  const [showDeclined, setShowDeclined] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<LenderOffer | null>(null);
  const [hardPullConsent, setHardPullConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let c = getCreditProfile();
    if (!c) { c = generateCreditProfile(); saveCreditProfile(c); }
    setCredit(c);
    setOffers(getOffers());
  }, []);

  const approved = useMemo(() =>
    offers.filter(o => o.status !== 'declined').sort((a, b) => {
      if (sort === 'rate') return a.apr - b.apr;
      if (sort === 'payment') return a.monthlyPayment - b.monthlyPayment;
      return a.termMonths - b.termMonths;
    }), [offers, sort]);

  const declined = useMemo(() => offers.filter(o => o.status === 'declined'), [offers]);

  const confirmOffer = () => {
    if (!selectedOffer || !hardPullConsent) return;
    const updated = offers.map(o => o.id === selectedOffer.id ? { ...o, status: 'selected' as const } : o);
    setOffers(updated);
    saveOffers(updated);
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckIcon />
          </div>
          <h2 className="text-2xl font-bold mb-3">Offer Selected</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">Your selection has been sent to {selectedOffer?.lenderName}. They will contact you within 1 business day to finalize.</p>
          <Link href="/status" className="inline-flex px-6 py-3 bg-purple hover:bg-purple-light rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">
            Track Your Application
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] bg-navy/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
          <Link href="/status" className="text-xs text-slate-400 hover:text-slate-50 transition-colors duration-200 cursor-pointer">Application Status</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Pre-Qualification Results</h1>
            <p className="text-sm text-slate-500 mt-1">{approved.length} offer{approved.length !== 1 ? 's' : ''} available</p>
          </div>
          {credit && (
            <div className="flex items-center gap-5 px-6 py-4 rounded-2xl surface">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">{credit.ficoScore}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-0.5">FICO</div>
              </div>
              <div className="w-px h-10 bg-white/[0.06]" />
              <div className="text-center">
                <div className="text-lg font-semibold">{credit.dtiPercent}%</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-0.5">DTI</div>
              </div>
              <div className="w-px h-10 bg-white/[0.06]" />
              <div className="text-center">
                <div className="text-lg font-semibold">${credit.totalMonthlyObligations.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-0.5">Monthly</div>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-8">
          {([['rate', 'Lowest Rate'], ['payment', 'Lowest Payment'], ['term', 'Shortest Term']] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)}
              className={`px-4 py-2 text-xs rounded-lg border transition-colors duration-200 cursor-pointer ${sort === key ? 'bg-purple/15 border-purple/30 text-purple-light' : 'border-white/[0.08] text-slate-500 hover:text-slate-50 hover:border-white/[0.16]'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Offers */}
        <div className="space-y-4">
          {approved.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-2xl surface surface-hover p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-semibold text-base">{offer.lenderName}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${tierColors[offer.tier]}`}>{tierLabels[offer.tier]}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">APR</div><div className="text-xl font-bold text-gold">{offer.apr}%</div></div>
                    <div><div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Monthly</div><div className="text-xl font-bold">${offer.monthlyPayment.toLocaleString()}</div></div>
                    <div><div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Term</div><div className="text-xl font-bold">{offer.termMonths} mo</div></div>
                    <div><div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Approved</div><div className="text-xl font-bold">${offer.approvedAmount.toLocaleString()}</div></div>
                  </div>
                  {offer.conditions && offer.conditions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {offer.conditions.map((c, j) => (
                        <span key={j} className="text-[10px] text-slate-500 px-2.5 py-1 bg-navy-light rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => { setSelectedOffer(offer); setHardPullConsent(false); }}
                    className="px-6 py-3 bg-purple hover:bg-purple-light text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer whitespace-nowrap">
                    Select This Offer
                  </button>
                  <span className="text-[10px] text-slate-600">Expires {new Date(offer.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Declined */}
        {declined.length > 0 && (
          <div className="mt-10">
            <button onClick={() => setShowDeclined(!showDeclined)} className="text-sm text-slate-500 hover:text-slate-50 transition-colors duration-200 cursor-pointer flex items-center gap-2">
              <svg className={`w-4 h-4 transition-transform duration-200 ${showDeclined ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              {declined.length} Declined Offer{declined.length !== 1 ? 's' : ''}
            </button>
            <AnimatePresence>
              {showDeclined && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 space-y-3">
                  {declined.map(offer => (
                    <div key={offer.id} className="surface rounded-xl p-5 opacity-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{offer.lenderName}</span>
                        <span className="text-xs text-red-400 px-2.5 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">Declined</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Does not meet underwriting criteria at this time.</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {approved.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-500 mb-6">No offers yet. Submit an application first.</p>
            <Link href="/apply" className="inline-flex px-6 py-3 bg-purple hover:bg-purple-light rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">Apply Now</Link>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedOffer && !confirmed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.2 }}
              className="bg-navy-light border border-white/[0.08] rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-2">Confirm Offer Selection</h3>
              <p className="text-sm text-slate-400 mb-6">You are selecting the offer from <strong className="text-slate-50">{selectedOffer.lenderName}</strong> at {selectedOffer.apr}% APR.</p>
              <div className="rounded-xl bg-navy/60 p-5 mb-6 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 text-xs">APR</span><div className="font-semibold mt-0.5">{selectedOffer.apr}%</div></div>
                <div><span className="text-slate-500 text-xs">Monthly</span><div className="font-semibold mt-0.5">${selectedOffer.monthlyPayment.toLocaleString()}</div></div>
                <div><span className="text-slate-500 text-xs">Term</span><div className="font-semibold mt-0.5">{selectedOffer.termMonths} months</div></div>
                <div><span className="text-slate-500 text-xs">Amount</span><div className="font-semibold mt-0.5">${selectedOffer.approvedAmount.toLocaleString()}</div></div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-6" onClick={(e) => { e.preventDefault(); setHardPullConsent(!hardPullConsent); }}>
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${hardPullConsent ? 'bg-purple border-purple' : 'border-white/20'}`}>
                  {hardPullConsent && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-xs text-slate-400 leading-relaxed">I understand that selecting this offer authorizes the lender to perform a hard credit inquiry, which may impact my credit score.</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setSelectedOffer(null)} className="flex-1 px-4 py-3 text-sm border border-white/[0.08] rounded-xl hover:bg-navy transition-colors duration-200 cursor-pointer">Cancel</button>
                <button onClick={confirmOffer} disabled={!hardPullConsent}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer ${hardPullConsent ? 'bg-purple hover:bg-purple-light' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                  Confirm Selection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
