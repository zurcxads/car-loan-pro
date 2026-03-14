/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, Suspense, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, Clock3 } from 'lucide-react';
import { SkeletonOfferCards } from '@/components/shared/Skeleton';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { isDev as isDevEnvironment } from '@/lib/env';

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

interface ResultsPayload {
  application?: {
    id: string;
    status: string;
    offersReceived: number;
    hasVehicle: boolean;
  };
  offers: AnonymizedOffer[];
  suggestedDownPayment: number;
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

function Tooltip({ content }: { content: string }) {
  const [show, setShow] = useState(false);
  const tooltipId = useId();

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        onClick={() => setShow(!show)}
        aria-label={content}
        aria-describedby={show ? tooltipId : undefined}
        className="w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <span className="text-[10px] font-semibold text-gray-600">?</span>
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg z-50"
          >
            <div className="relative">
              {content}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const compareDialogRef = useRef<HTMLDivElement>(null);
  const confirmDialogRef = useRef<HTMLDivElement>(null);
  const downPaymentInputId = 'results-down-payment';

  const [offers, setOffers] = useState<AnonymizedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<string>('pending_decision');
  const [term, setTerm] = useState(60);
  const [downPayment, setDownPayment] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<AnonymizedOffer | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sortBy, setSortBy] = useState<'best_rate' | 'lowest_payment' | 'highest_amount'>('best_rate');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useFocusTrap(showCompareModal, compareDialogRef, () => {
    setShowCompareModal(false);
    setSelectedForCompare([]);
    setCompareMode(false);
  });
  useFocusTrap(showConfirmModal, confirmDialogRef, () => setShowConfirmModal(false));

  const isDev = isDevEnvironment();

  // Calculate average dealer rate (for comparison)
  const averageDealerRate = 8.5; // Average dealer APR (would be fetched from backend in production)

  useEffect(() => {
    // Dev mode: show mock offers without a session cookie
    if (isDev) {
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

    let cancelled = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const loadResults = async () => {
      try {
        const res = await fetch('/api/results', { cache: 'no-store' });
        const data = await res.json();

        if (!data.success) {
          toast.error(data.error || 'Failed to load offers');
          router.push('/apply');
          return;
        }

        const payload = (data.data || {}) as ResultsPayload;
        const nextOffers = payload.offers || [];
        const nextStatus = payload.application?.status || 'pending_decision';

        if (cancelled) return;

        setApplicationStatus(nextStatus);
        setOffers(nextOffers);
        setDownPayment(payload.suggestedDownPayment || 0);

        if (nextOffers.length === 0 && nextStatus === 'pending_decision' && attempts < 5) {
          attempts += 1;
          retryTimer = setTimeout(loadResults, 1000);
          return;
        }

        setLoading(false);

        if (nextOffers.length > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load offers');
          router.push('/apply');
        }
      }
    };

    loadResults();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [router, isDev]);

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

  const calculateSavings = (offer: AnonymizedOffer, termMonths: number, down: number): number => {
    const principal = offer.approvedAmount - down;
    const tier = offer.rateTiers.find(t => t.termMonths === termMonths);
    const apr = tier ? (tier.rateMin + tier.rateMax) / 2 : offer.apr;

    // Calculate cost with this offer
    const monthlyRate = apr / 100 / 12;
    const payment = principal > 0 && monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
      : 0;
    const totalCost = payment * termMonths;

    // Calculate cost with average dealer rate
    const dealerMonthlyRate = averageDealerRate / 100 / 12;
    const dealerPayment = principal > 0
      ? (principal * dealerMonthlyRate * Math.pow(1 + dealerMonthlyRate, termMonths)) / (Math.pow(1 + dealerMonthlyRate, termMonths) - 1)
      : 0;
    const dealerTotalCost = dealerPayment * termMonths;

    return Math.round(dealerTotalCost - totalCost);
  };

  // Sort offers based on selected criteria
  const getSortedOffers = () => {
    const sorted = [...offers];
    if (sortBy === 'best_rate') {
      sorted.sort((a, b) => {
        const aRate = a.rateTiers.find(t => t.termMonths === term);
        const bRate = b.rateTiers.find(t => t.termMonths === term);
        const aAPR = aRate ? (aRate.rateMin + aRate.rateMax) / 2 : a.apr;
        const bAPR = bRate ? (bRate.rateMin + bRate.rateMax) / 2 : b.apr;
        return aAPR - bAPR;
      });
    } else if (sortBy === 'lowest_payment') {
      sorted.sort((a, b) => calculatePayment(a, term, downPayment) - calculatePayment(b, term, downPayment));
    } else if (sortBy === 'highest_amount') {
      sorted.sort((a, b) => (b.maxApprovedAmount || b.approvedAmount) - (a.maxApprovedAmount || a.approvedAmount));
    }
    return sorted;
  };

  const toggleCompareSelection = (offerId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(offerId)) {
        return prev.filter(id => id !== offerId);
      } else if (prev.length < 2) {
        const newSelection = [...prev, offerId];
        if (newSelection.length === 2) {
          setTimeout(() => setShowCompareModal(true), 300);
        }
        return newSelection;
      }
      return prev;
    });
  };

  // Get expiration date (30 days from today)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);

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
        router.push('/dashboard');
      }, 1500);
      return;
    }

    try {
      const res = await fetch('/api/offers/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: selectedOffer.id,
          selectedTerm: term,
          selectedDownPayment: downPayment,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to select offer');
        setCalculating(false);
        return;
      }

      // Reveal lender and redirect to dashboard with pre-approval letter
      toast.success(`Pre-approved with ${data.data?.lenderName || 'your lender'}!`);
      setTimeout(() => {
        router.push(data.data?.redirectTo || '/dashboard');
      }, 1500);
    } catch {
      toast.error('Failed to select offer');
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" aria-live="polite">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg">Auto Loan Pro</Link>
            <div className="text-sm text-gray-600">Finding your rates...</div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Analyzing your application...
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Finding Your Best Rates
            </h1>
            <p className="text-gray-600 text-lg">
              Matching you with lenders in our network
            </p>
          </motion.div>

          <SkeletonOfferCards count={3} />
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${applicationStatus === 'pending_decision' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
            {applicationStatus === 'pending_decision' ? (
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {applicationStatus === 'pending_decision' ? 'Still Matching Lenders' : 'No Offers Available'}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {applicationStatus === 'pending_decision'
              ? 'Your application was submitted successfully. We are still finalizing your offers.'
              : 'We could not find matching offers at this time. Our team will review your application manually.'}
          </p>
          <Link href="/" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            {applicationStatus === 'pending_decision' ? 'Return to Home' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...offers.map(o => o.maxApprovedAmount || o.approvedAmount));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="min-h-screen bg-gray-50">
      {showConfetti && <Confetti />}

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg">Auto Loan Pro</Link>
          <div className="text-sm text-gray-600">Your Pre-Approval Offers</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="sr-only" aria-live="polite">
          {calculating ? 'Updating offer estimates' : `${offers.length} offers available`}
        </div>
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
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
          >
            <Check className="h-5 w-5" />
            Pre-Approved!
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Done. That Was Easy.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <p className="text-gray-600 text-lg mb-3">You qualify for up to</p>
            <div className="text-6xl md:text-7xl font-bold text-blue-600">
              ${maxAmount.toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Near-Prime · Based on your profile
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Clock3 className="h-4 w-4" />
              You just saved ~15 hours
            </div>
          </motion.div>
        </motion.div>

        {/* Interactive Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Customize Your Terms</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="block text-xs text-gray-600 mb-3 font-medium">Loan Term</div>
              <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 px-1 scrollbar-hide">
                {TERM_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTerm(t);
                      setCalculating(true);
                      setTimeout(() => setCalculating(false), 300);
                    }}
                    className={`px-4 py-2.5 min-h-[44px] min-w-[60px] text-xs font-medium rounded-lg border transition-all flex-shrink-0 active:scale-[0.98] transition-transform ${
                      term === t
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                    aria-pressed={term === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor={downPaymentInputId} className="block text-xs text-gray-600 mb-3 font-medium">
                Down Payment: <span className="text-gray-900 font-semibold">${downPayment.toLocaleString()}</span>
              </label>
              <input
                id={downPaymentInputId}
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
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>$0</span>
                <span>${maxAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sort & Compare Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-zinc-200 font-medium">Sort by:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSortBy('best_rate')}
                className={`px-3 py-2.5 min-h-[44px] text-xs font-medium rounded-lg border transition-all active:scale-[0.98] transition-transform ${
                  sortBy === 'best_rate'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
                aria-pressed={sortBy === 'best_rate'}>
                Best Rate
              </button>
              <button
                type="button"
                onClick={() => setSortBy('lowest_payment')}
                className={`px-3 py-2.5 min-h-[44px] text-xs font-medium rounded-lg border transition-all active:scale-[0.98] transition-transform ${
                  sortBy === 'lowest_payment'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
                aria-pressed={sortBy === 'lowest_payment'}>
                Lowest Payment
              </button>
              <button
                type="button"
                onClick={() => setSortBy('highest_amount')}
                className={`px-3 py-2.5 min-h-[44px] text-xs font-medium rounded-lg border transition-all active:scale-[0.98] transition-transform ${
                  sortBy === 'highest_amount'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
                aria-pressed={sortBy === 'highest_amount'}>
                Highest Amount
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2.5 min-h-[44px] text-sm font-medium rounded-lg border transition-all active:scale-[0.98] transition-transform ${
              compareMode
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
            aria-pressed={compareMode}
          >
            {compareMode ? 'Exit Compare' : 'Compare Offers'}
          </button>
        </motion.div>

        {/* Rate Lock Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-6 flex items-start gap-3"
        >
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Rate Lock Guarantee</h4>
            <p className="text-xs text-gray-600 dark:text-zinc-300">
              Your rates are locked until <strong>{expirationDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> (30 days from today)
            </p>
          </div>
        </motion.div>

        {/* Offers Grid - Single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {getSortedOffers().slice(0, 3).map((offer, index) => {
            const payment = calculatePayment(offer, term, downPayment);
            const totalCost = calculateTotalCost(offer, term, downPayment);
            const savings = calculateSavings(offer, term, downPayment);
            const tier = offer.rateTiers.find(t => t.termMonths === term);
            const apr = tier ? (tier.rateMin + tier.rateMax) / 2 : offer.apr;
            const isSelected = selectedForCompare.includes(offer.id);

            const tagLabels = {
              best_rate: 'Best Rate',
              lowest_payment: 'Lowest Payment',
              highest_amount: 'Highest Amount'
            };

            // Approval odds (would be calculated from credit profile in production)
            const approvalOdds = apr < 6 ? 'High Approval Odds' : apr < 8 ? 'Good Approval Odds' : 'Fair Approval Odds';
            const oddsColor = apr < 6 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : apr < 8 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: calculating ? [0, -4, 0] : 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: calculating ? 0.3 : 0.5 }}
                className={`bg-white dark:bg-zinc-900/50 rounded-2xl border-2 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full ${
                  isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'border-gray-200 dark:border-zinc-800 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {compareMode && (
                      <button
                        type="button"
                        onClick={() => toggleCompareSelection(offer.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-zinc-600 hover:border-blue-400'
                        }`}
                        aria-label={`Compare ${offer.label}`}
                        aria-pressed={isSelected}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">{offer.label}</h3>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    {offer.tag && (
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        offer.tag === 'best_rate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                        offer.tag === 'lowest_payment' ? 'bg-blue-100 text-blue-700' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}>
                        {tagLabels[offer.tag]}
                      </span>
                    )}
                    {index === 0 && (
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${oddsColor}`}>
                        {approvalOdds}
                      </span>
                    )}
                  </div>
                </div>

                {/* Savings Badge */}
                {savings > 0 && (
                  <div className="mb-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg px-3 py-2">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Save ${savings.toLocaleString()}</strong> vs. average dealer markup
                    </p>
                  </div>
                )}

                <div className="space-y-5 flex-1">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs text-gray-500 dark:text-zinc-400">APR</span>
                      <Tooltip content="Annual Percentage Rate - the yearly cost of your loan including interest" />
                    </div>
                    <div className="text-5xl font-bold text-gray-900 dark:text-zinc-100">{apr.toFixed(2)}%</div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs text-gray-500 dark:text-zinc-400">Monthly Payment</span>
                      <Tooltip content="Your estimated monthly payment including principal and interest" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-zinc-100">${payment.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">for {term} months</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs text-gray-500 dark:text-zinc-400">Total Cost</span>
                      <Tooltip content="Total amount you'll pay over the life of the loan (principal + interest + down payment)" />
                    </div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-zinc-300">${totalCost.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">over {term} months</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs text-gray-500 dark:text-zinc-400">Approved Amount</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                      {offer.maxApprovedAmount
                        ? `Up to $${offer.maxApprovedAmount.toLocaleString()}`
                        : `$${offer.approvedAmount.toLocaleString()}`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectClick(offer)}
                  disabled={calculating}
                  className="w-full mt-6 px-6 py-4 min-h-[48px] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
          className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-2">About These Offers</h2>
              <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed mb-3">
                Offers are anonymized to help you focus on the numbers, not the brand. When you select an offer, the lender will be revealed and you'll receive your pre-approval letter.
              </p>
              <p className="text-xs text-gray-600 dark:text-zinc-300">
                <strong>Important:</strong> Rates shown are estimates. A hard credit inquiry will be performed by the lender to finalize your offer. This may affect your credit score.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showCompareModal && selectedForCompare.length === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => {
              setShowCompareModal(false);
              setSelectedForCompare([]);
              setCompareMode(false);
            }}
          >
            <motion.div
              ref={compareDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="compare-offers-title"
              tabIndex={-1}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 id="compare-offers-title" className="text-2xl font-bold text-gray-900">Compare Offers</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowCompareModal(false);
                    setSelectedForCompare([]);
                    setCompareMode(false);
                  }}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label="Close compare offers dialog"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {selectedForCompare.map(offerId => {
                  const offer = offers.find(o => o.id === offerId);
                  if (!offer) return null;

                  const payment = calculatePayment(offer, term, downPayment);
                  const totalCost = calculateTotalCost(offer, term, downPayment);
                  const savings = calculateSavings(offer, term, downPayment);
                  const tier = offer.rateTiers.find(t => t.termMonths === term);
                  const apr = tier ? (tier.rateMin + tier.rateMax) / 2 : offer.apr;

                  return (
                    <div key={offer.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">{offer.label}</h3>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                          <span className="text-sm text-gray-600">APR</span>
                          <span className="text-2xl font-bold text-gray-900">{apr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                          <span className="text-sm text-gray-600">Monthly Payment</span>
                          <span className="text-xl font-bold text-gray-900">${payment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                          <span className="text-sm text-gray-600">Total Cost</span>
                          <span className="text-lg font-semibold text-gray-700">${totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                          <span className="text-sm text-gray-600">Savings vs. Dealer</span>
                          <span className="text-lg font-semibold text-blue-600">${savings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                          <span className="text-sm text-gray-600">Approved Amount</span>
                          <span className="text-lg font-semibold text-gray-900">
                            ${(offer.maxApprovedAmount || offer.approvedAmount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Loan Term</span>
                          <span className="text-sm font-semibold text-gray-900">{term} months</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCompareModal(false);
                          handleSelectClick(offer);
                        }}
                        className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Select {offer.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              ref={confirmDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-offer-title"
              tabIndex={-1}
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
                <h2 id="confirm-offer-title" className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Selection</h2>
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

              <p className="text-xs text-gray-600 mb-6 text-center">
                This will reveal the lender and generate your pre-approval letter. You can review it before proceeding to finalize.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center" aria-live="polite"><div className="text-gray-600">Loading...</div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
