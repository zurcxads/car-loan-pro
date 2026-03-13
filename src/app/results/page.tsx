"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
}

interface RateTier {
  termMonths: number;
  rateMin: number;
  rateMax: number;
}

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84];

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [offers, setOffers] = useState<AnonymizedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState(60);
  const [downPayment, setDownPayment] = useState(0);
  const [calculating, setCalculating] = useState(false);

  const isDev = searchParams.get('dev') === 'true';

  useEffect(() => {
    // Dev mode: show mock offers without token
    if (isDev || !token) {
      if (!token && !isDev) {
        router.push('/apply');
        return;
      }
      // Mock offers for dev/preview mode
      setOffers([
        { id: 'demo-1', label: 'Offer A', lenderId: 'LND-001', apr: 4.2, baseApr: 4.2, monthlyPayment: 465, approvedAmount: 32000, maxApprovedAmount: 35000, rateTiers: [] },
        { id: 'demo-2', label: 'Offer B', lenderId: 'LND-002', apr: 5.8, baseApr: 5.8, monthlyPayment: 398, approvedAmount: 30000, maxApprovedAmount: 32000, rateTiers: [] },
        { id: 'demo-3', label: 'Offer C', lenderId: 'LND-003', apr: 7.1, baseApr: 7.1, monthlyPayment: 542, approvedAmount: 28000, maxApprovedAmount: 30000, rateTiers: [] },
      ]);
      setLoading(false);
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
        }
      })
      .catch(() => {
        toast.error('Failed to load offers');
        router.push('/apply');
      });
  }, [token, router]);

  // Recalculate payment based on term and down payment
  const calculatePayment = (offer: AnonymizedOffer, termMonths: number, down: number): number => {
    const principal = offer.approvedAmount - down;
    if (principal <= 0) return 0;

    // Find rate tier for selected term
    const tier = offer.rateTiers.find(t => t.termMonths === termMonths);
    if (!tier) return 0;

    // Use midpoint of rate tier
    const apr = (tier.rateMin + tier.rateMax) / 2;
    const monthlyRate = apr / 100 / 12;

    if (monthlyRate === 0) return principal / termMonths;

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    return Math.round(payment);
  };

  const handleSelectOffer = async (offer: AnonymizedOffer) => {
    setCalculating(true);

    try {
      const res = await fetch('/api/results/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          offerId: offer.id,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="text-sm text-gray-500">Your Pre-Approval Offers</div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! You have {offers.length} offers.</h1>
            <p className="text-gray-500">Compare offers below. Select the one that works best for you to reveal the lender and get your pre-approval letter.</p>
          </div>

          {/* Interactive Controls */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Customize Your Terms</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Loan Term</label>
                <div className="flex gap-2">
                  {TERM_OPTIONS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        term === t
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t} mo
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Down Payment: ${downPayment.toLocaleString()}</label>
                <input
                  type="range"
                  min="0"
                  max={offers[0]?.approvedAmount || 50000}
                  step="500"
                  value={downPayment}
                  onChange={e => setDownPayment(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$0</span>
                  <span>${(offers[0]?.approvedAmount || 50000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {offers.slice(0, 3).map((offer, index) => {
              const payment = calculatePayment(offer, term, downPayment);
              const tier = offer.rateTiers.find(t => t.termMonths === term);
              const apr = tier ? (tier.rateMin + tier.rateMax) / 2 : offer.apr;

              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border-2 p-6 transition-all border-gray-200 hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{offer.label}</h3>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Best Rate
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">APR</div>
                      <div className="text-3xl font-bold text-gray-900">{apr.toFixed(2)}%</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Monthly Payment</div>
                      <div className="text-2xl font-semibold text-gray-900">${payment.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">for {term} months</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Approved Amount</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {offer.maxApprovedAmount
                          ? `Up to $${offer.maxApprovedAmount.toLocaleString()}`
                          : `$${offer.approvedAmount.toLocaleString()}`}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Down Payment</div>
                      <div className="text-sm font-medium text-gray-900">${downPayment.toLocaleString()}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectOffer(offer)}
                    disabled={calculating}
                    className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {calculating ? 'Processing...' : 'Select This Offer'}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Info Banner */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">About These Offers</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Offers are anonymized to help you focus on the numbers, not the brand. When you select an offer, the lender will be revealed and you&apos;ll receive your pre-approval letter. These are real offers from lenders in our network.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
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
