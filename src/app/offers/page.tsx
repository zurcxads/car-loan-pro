"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getOffers, getCreditProfile, saveOffers, generateCreditProfile, saveCreditProfile } from '@/lib/store';
import type { LenderOffer, CreditPullResult } from '@/lib/types';

const tierColors: Record<string, string> = {
  prime: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  near_prime: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  subprime: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  specialty: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const tierLabels: Record<string, string> = {
  prime: 'Prime', near_prime: 'Near-Prime', subprime: 'Subprime', specialty: 'Specialty',
};

type SortKey = 'rate' | 'payment' | 'term';

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
    const o = getOffers();
    setOffers(o);
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
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Offer Selected</h2>
          <p className="text-zinc-400 text-sm mb-6">Your selection has been sent to {selectedOffer?.lenderName}. They will contact you within 1 business day to finalize.</p>
          <Link href="/status" className="inline-flex px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
            Track Your Application
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
          <Link href="/status" className="text-xs text-zinc-400 hover:text-white transition-colors">Application Status</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Pre-Qualification Results</h1>
            <p className="text-sm text-zinc-500 mt-1">{approved.length} offer{approved.length !== 1 ? 's' : ''} available</p>
          </div>
          {credit && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-white/5">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{credit.ficoScore}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">FICO</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-lg font-semibold">{credit.dtiPercent}%</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">DTI</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-lg font-semibold">${credit.totalMonthlyObligations.toLocaleString()}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Monthly</div>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-6">
          {([['rate', 'Lowest Rate'], ['payment', 'Lowest Payment'], ['term', 'Shortest Term']] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${sort === key ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' : 'border-white/10 text-zinc-500 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Offers */}
        <div className="space-y-4">
          {approved.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{offer.lenderName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierColors[offer.tier]}`}>{tierLabels[offer.tier]}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><div className="text-xs text-zinc-500">APR</div><div className="text-lg font-bold text-blue-400">{offer.apr}%</div></div>
                    <div><div className="text-xs text-zinc-500">Monthly</div><div className="text-lg font-bold">${offer.monthlyPayment.toLocaleString()}</div></div>
                    <div><div className="text-xs text-zinc-500">Term</div><div className="text-lg font-bold">{offer.termMonths} mo</div></div>
                    <div><div className="text-xs text-zinc-500">Approved</div><div className="text-lg font-bold">${offer.approvedAmount.toLocaleString()}</div></div>
                  </div>
                  {offer.conditions && offer.conditions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {offer.conditions.map((c, j) => (
                        <span key={j} className="text-[10px] text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => { setSelectedOffer(offer); setHardPullConsent(false); }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                    Select This Offer
                  </button>
                  <span className="text-[10px] text-zinc-600">Expires {new Date(offer.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Declined */}
        {declined.length > 0 && (
          <div className="mt-8">
            <button onClick={() => setShowDeclined(!showDeclined)} className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
              <svg className={`w-4 h-4 transition-transform ${showDeclined ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              {declined.length} Declined Offer{declined.length !== 1 ? 's' : ''}
            </button>
            <AnimatePresence>
              {showDeclined && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 space-y-3">
                  {declined.map(offer => (
                    <div key={offer.id} className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{offer.lenderName}</span>
                        <span className="text-xs text-red-400 px-2 py-0.5 bg-red-500/10 rounded-full border border-red-500/20">Declined</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1">Does not meet underwriting criteria at this time.</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {approved.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-500 mb-4">No offers yet. Submit an application first.</p>
            <Link href="/apply" className="inline-flex px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">Apply Now</Link>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {selectedOffer && !confirmed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-1">Confirm Offer Selection</h3>
              <p className="text-sm text-zinc-400 mb-4">You are selecting the offer from <strong className="text-white">{selectedOffer.lenderName}</strong> at {selectedOffer.apr}% APR.</p>
              <div className="bg-zinc-800/50 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-zinc-500">APR</span><div className="font-semibold">{selectedOffer.apr}%</div></div>
                <div><span className="text-zinc-500">Monthly</span><div className="font-semibold">${selectedOffer.monthlyPayment.toLocaleString()}</div></div>
                <div><span className="text-zinc-500">Term</span><div className="font-semibold">{selectedOffer.termMonths} months</div></div>
                <div><span className="text-zinc-500">Amount</span><div className="font-semibold">${selectedOffer.approvedAmount.toLocaleString()}</div></div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-5">
                <input type="checkbox" checked={hardPullConsent} onChange={e => setHardPullConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-zinc-800 text-blue-600" />
                <span className="text-xs text-zinc-400 leading-relaxed">I understand that selecting this offer authorizes the lender to perform a hard credit inquiry, which may impact my credit score.</span>
              </label>
              <div className="flex gap-3">
                <button onClick={() => setSelectedOffer(null)} className="flex-1 px-4 py-2.5 text-sm border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
                <button onClick={confirmOffer} disabled={!hardPullConsent}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${hardPullConsent ? 'bg-blue-600 hover:bg-blue-500' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>
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
