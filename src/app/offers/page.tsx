"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MOCK_APPLICATIONS, getOffersForApplication, type MockOffer } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import OfferCard from '@/components/offers/OfferCard';
import ComparisonTable from '@/components/offers/ComparisonTable';
import HardPullConsentModal from '@/components/offers/HardPullConsentModal';

type SortKey = 'rate' | 'payment' | 'term';

// Map lender names to tiers from the mock data
const lenderTiers: Record<string, string> = {
  'Ally Financial': 'near_prime',
  'Capital One Auto': 'prime',
  'Chase Auto': 'prime',
  'Westlake Financial': 'subprime',
  'Prestige Financial': 'subprime',
  'TD Auto Finance': 'near_prime',
  'Bank of America': 'prime',
};

export default function OffersPage() {
  const router = useRouter();
  const [sort, setSort] = useState<SortKey>('rate');
  const [selectedOffer, setSelectedOffer] = useState<MockOffer | null>(null);

  // Load APP-001 offers by default for demo
  const demoApp = MOCK_APPLICATIONS[0]; // APP-001: Marcus Johnson
  const offers = useMemo(() => getOffersForApplication('APP-001'), []);

  const sorted = useMemo(() => {
    const copy = [...offers];
    switch (sort) {
      case 'rate': return copy.sort((a, b) => a.apr - b.apr);
      case 'payment': return copy.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
      case 'term': return copy.sort((a, b) => a.termMonths - b.termMonths);
      default: return copy;
    }
  }, [offers, sort]);

  const handleConfirm = (offer: MockOffer) => {
    // Save selected offer to localStorage
    localStorage.setItem('clp_selected_offer', JSON.stringify(offer));
    localStorage.setItem('clp_demo_app', JSON.stringify(demoApp));
    localStorage.setItem('clp_offer_selected_at', new Date().toISOString());
    router.push('/status');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#09090B]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
          <Link href="/status" className="text-xs text-zinc-400 hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Application Status</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Pre-Qualification Results</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Showing results for {demoApp.vehicle.year} {demoApp.vehicle.make} {demoApp.vehicle.model} -- {formatCurrency(demoApp.loanAmount)}
            </p>
          </div>
          <span className="text-[10px] px-3 py-1.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25 font-medium whitespace-nowrap self-start">
            {offers.length} Offers Available
          </span>
        </div>

        {/* Sort bar */}
        <div className="flex gap-2 mb-8">
          {([['rate', 'Lowest Rate'], ['payment', 'Lowest Payment'], ['term', 'Shortest Term']] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-4 py-2 text-xs rounded-lg border transition-colors duration-200 cursor-pointer ${
                sort === key
                  ? 'bg-blue-600/15 border-blue-600/30 text-blue-400'
                  : 'border-white/10 text-zinc-500 hover:text-zinc-50 hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Offer cards */}
        <div className="space-y-4 mb-10">
          {sorted.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <OfferCard
                offer={offer}
                isLowestRate={offer.apr === Math.min(...offers.map(o => o.apr))}
                lenderTier={lenderTiers[offer.lenderName] || 'prime'}
                onSelect={setSelectedOffer}
              />
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <ComparisonTable offers={sorted} />

        {/* Empty state */}
        {offers.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-zinc-500 mb-6">No offers yet. Submit an application first.</p>
            <Link href="/apply" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">
              Apply Now
            </Link>
          </div>
        )}
      </div>

      {/* Hard pull consent modal */}
      {selectedOffer && (
        <HardPullConsentModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
