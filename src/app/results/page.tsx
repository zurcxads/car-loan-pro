"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface AnonymizedOffer {
  id: string;
  label: string; // "Offer A", "Offer B", "Offer C"
  lenderId: string;
  apr: number;
  baseApr: number;
  monthlyPayment: number;
  approvedAmount: number;
  maxApprovedAmount?: number;
  rateTiers: RateTier[];
  tag?: 'best_rate' | 'lowest_payment' | 'highest_amount';
}

interface RateTier {
  termMonths: number;
  rateMin: number;
  rateMax: number;
}

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84];

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: Math.random() * 360,
            opacity: 1
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 360 + 360,
            opacity: 0
          }}
          transition={{
            duration: Math.random() * 2 + 3,
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [offers, setOffers] = useState<AnonymizedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(60);
  const [downPayment, setDownPayment] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<AnonymizedOffer | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isDev = searchParams.get('dev') === 'true';

  useEffect(() => {
    // Dev mode: show mock offers without token
    if (isDev || !token) {
      if (!token && !isDev) {
        router.push('/apply');
        return;
      }
      // Mock offers for dev/preview mode with tags
      setOffers([
        {
          id: 'demo-1',
          label: 'Offer A',
          lenderId: 'LND-001',
          apr: 4.2,
          baseApr: 4.2,
          monthlyPayment: 465,
          approvedAmount: 32000,
          maxApprovedAmount: 35000,
          rateTiers: [
            { termMonths: 24, rateMin: 3.9, rateMax: 4.5 },
            { termMonths: 36, rateMin: 4.0, rateMax: 4.6 },
            { termMonths: 48, rateMin: 4.1, rateMax: 4.7 },
            { termMonths: 60, rateMin: 4.2, rateMax: 4.8 },
            { termMonths: 72, rateMin: 4.4, rateMax: 5.0 },
            { termMonths: 84, rateMin: 4.6, rateMax: 5.2 },
          ],
          tag: 'best_rate'
        },
        {
          id: 'demo-2',
          label: 'Offer B',
          lenderId: 'LND-002',
          apr: 5.8,
          baseApr: 5.8,
          monthlyPayment: 398,
          approvedAmount: 30000,
          maxApprovedAmount: 32000,
          rateTiers: [
            { termMonths: 24, rateMin: 5.5, rateMax: 6.1 },
            { termMonths: 36, rateMin: 5.6, rateMax: 6.2 },
            { termMonths: 48, rateMin: 5.7, rateMax: 6.3 },
            { termMonths: 60, rateMin: 5.8, rateMax: 6.4 },
            { termMonths: 72, rateMin: 6.0, rateMax: 6.6 },
            { termMonths: 84, rateMin: 6.2, rateMax: 6.8 },
          ],
          tag: 'lowest_payment'
        },
        {
          id: 'demo-3',
          label: 'Offer C',
          lenderId: 'LND-003',
          apr: 7.1,
          baseApr: 7.1,
          monthlyPayment: 542,
          approvedAmount: 28000,
          maxApprovedAmount: 30000,
          rateTiers: [
            { termMonths: 24, rateMin: 6.8, rateMax: 7.4 },
            { termMonths: 36, rateMin: 6.9, rateMax: 7.5 },
            { termMonths: 48, rateMin: 7.0, rateMax: 7.6 },
            { termMonths: 60, rateMin: 7.1, rateMax: 7.7 },
            { termMonths: 72, rateMin: 7.3, rateMax: 7.9 },
            { termMonths: 84, rateMin: 7.5, rateMax: 8.1 },
          ],
          tag: 'highest_amount'
        },
      ]);
      setLoading(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      return;
    }

    // Fetch offers from backend
    fetch(`/api/results?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error(data.error);
          router.push('/apply');
        } else {
          setOffers(data.offers || []);
          setDownPayment(data.suggestedDownPayment || 0);
          setLoading(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      })
      .catch(() => {
        toast.error('Failed to load offers');
        router.push('/apply');
      });
  }, [token, router, isDev]);

  // Recalculate payment based on term and down payment
  const calculatePayment = (offer: AnonymizedOffer, termMonths: number, down: number): number => {
    const principal = offer.approvedAmount - down;
    if (principal <= 0) return 0;

    // Find rate tier for selected term
    const tier = offer.rateTiers.find(t => t.termMonths === termMonths);
    if (!tier) return offer.monthlyPayment; // Fallback to base payment

    // Use midpoint of rate tier
    const apr = (tier.rateMin + tier.rateMax) / 2;
    const monthlyRate = apr / 100 / 12;

    if (monthlyRate === 0) return principal / termMonths;

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    return Math.round(payment);
  };

  const calculateTotalCost = (offer: AnonymizedOffer, termMonths: number, down: number): number => {
    const payment = calculatePayment(offer, termMonths, down);
    return payment * termMonths + down;
  };

  const handleSelectClick = (offer: AnonymizedOffer) => {
    setSelectedOffer(offer);
    setShowConfirmModal(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedOffer) return;

    setShowConfirmModal(false);
    setCalculating(true);

    // Dev mode: skip API, go to dashboard
    if (isDev) {
      setTimeout(() => {
        router.push('/dashboard?dev=true');
      }, 1500);
      return;
    }

    try {
      const res = await fetch('/api/results/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          offerId: selectedOffer.id,
          selectedTerm: term,
          selectedDownPayment: downPayment,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        setCalculating(false);
        return;
      }

      // Reveal lender and redirect to dashboard with pre-approval letter
      toast.success(`Pre-approved with ${data.lenderName}!`);
      setTimeout(() => {
        router.push(`/dashboard?token=${token}`);
      }, 1500);
    } catch {
      toast.error('Failed to select offer');
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding your best rates...</h2>
          <p className="text-sm text-gray-500">Matching you with lenders in our network</p>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Offers Available</h2>
          <p className="text-sm text-gray-500 mb-6">We could not find matching offers at this time. Our team will review your application manually.</p>
          <Link href="/" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...offers.map(o => o.maxApprovedAmount || o.approvedAmount));

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && <Confetti />}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="text-sm text-gray-500">Your Pre-Approval Offers</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium mb-6"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Pre-Approved!
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Congratulations!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <p className="text-gray-500 text-lg mb-3">You qualify for up to</p>
            <div className="text-6xl md:text-7xl font-bold text-blue-600">
              ${maxAmount.toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Near-Prime · Based on your profile
          </motion.div>
        </motion.div>

        {/* Interactive Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Customize Your Terms</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-3 font-medium">Loan Term</label>
              <div className="grid grid-cols-6 gap-2">
                {TERM_OPTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setTerm(t);
                      setCalculating(true);
                      setTimeout(() => setCalculating(false), 300);
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      term === t
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-3 font-medium">
                Down Payment: <span className="text-gray-900 font-semibold">${downPayment.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="0"
                max={maxAmount}
                step="500"
                value={downPayment}
                onChange={e => {
                  setDownPayment(Number(e.target.value));
                  setCalculating(true);
                  setTimeout(() => setCalculating(false), 300);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>$0</span>
                <span>${maxAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {offers.slice(0, 3).map((offer, index) => {
            const payment = calculatePayment(offer, term, downPayment);
            const totalCost = calculateTotalCost(offer, term, downPayment);
            const tier = offer.rateTiers.find(t => t.termMonths === term);
            const apr = tier ? (tier.rateMin + tier.rateMax) / 2 : offer.apr;

            const tagLabels = {
              best_rate: 'Best Rate',
              lowest_payment: 'Lowest Payment',
              highest_amount: 'Highest Amount'
            };

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: calculating ? [1, 0.7, 1] : 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: calculating ? 0.3 : 0.5 }}
                className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{offer.label}</h3>
                  {offer.tag && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      offer.tag === 'best_rate' ? 'bg-green-100 text-green-700' :
                      offer.tag === 'lowest_payment' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {tagLabels[offer.tag]}
                    </span>
                  )}
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <div className="text-xs text-gray-500 mb-2">APR</div>
                    <div className="text-5xl font-bold text-gray-900">{apr.toFixed(2)}%</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-2">Monthly Payment</div>
                    <div className="text-3xl font-bold text-gray-900">${payment.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">for {term} months</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Total Cost Over Life of Loan</div>
                    <div className="text-lg font-semibold text-gray-700">${totalCost.toLocaleString()}</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Approved Amount</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {offer.maxApprovedAmount
                        ? `Up to $${offer.maxApprovedAmount.toLocaleString()}`
                        : `$${offer.approvedAmount.toLocaleString()}`}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectClick(offer)}
                  disabled={calculating}
                  className="w-full mt-6 px-6 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg active:scale-[0.98]"
                >
                  Select This Offer
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">About These Offers</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Offers are anonymized to help you focus on the numbers, not the brand. When you select an offer, the lender will be revealed and you'll receive your pre-approval letter.
              </p>
              <p className="text-xs text-gray-500">
                <strong>Important:</strong> Rates shown are estimates. A hard credit inquiry will be performed by the lender to finalize your offer. This may affect your credit score.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Selection</h2>
                <p className="text-sm text-gray-600">
                  Proceeding with <strong>{selectedOffer.label}</strong> at <strong>{calculatePayment(selectedOffer, term, downPayment) > 0 ?
                    `${((selectedOffer.rateTiers.find(t => t.termMonths === term)?.rateMin || 0) + (selectedOffer.rateTiers.find(t => t.termMonths === term)?.rateMax || 0)) / 2}` :
                    selectedOffer.apr}% APR</strong>.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-gray-900">${calculatePayment(selectedOffer, term, downPayment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Term:</span>
                  <span className="font-semibold text-gray-900">{term} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment:</span>
                  <span className="font-semibold text-gray-900">${downPayment.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-6 text-center">
                This will reveal the lender and generate your pre-approval letter. You can review it before proceeding to finalize.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
