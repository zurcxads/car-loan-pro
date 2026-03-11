"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useOffers, apiPost } from '@/lib/hooks';
import { MOCK_APPLICATIONS, getOffersForApplication, type MockOffer } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/format-utils';
import OfferCard from '@/components/offers/OfferCard';
import ComparisonTable from '@/components/offers/ComparisonTable';
import HardPullConsentModal from '@/components/offers/HardPullConsentModal';

type SortKey = 'rate' | 'payment' | 'term';

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
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [sort, setSort] = useState<SortKey>('rate');
  const [selectedOffer, setSelectedOffer] = useState<MockOffer | null>(null);
  const [appId, setAppId] = useState<string>('APP-001');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/apply');
      return;
    }

    // Verify session token
    fetch(`/api/dashboard?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          router.push('/apply');
        } else {
          setAppId(data.application.id);
          setVerified(true);
        }
      })
      .catch(() => router.push('/apply'));
  }, [token, router]);

  const { data: apiOffers, isLoading } = useOffers(appId);

  const demoApp = MOCK_APPLICATIONS[0];
  const offers: MockOffer[] = useMemo(() => {
    if (apiOffers && Array.isArray(apiOffers) && apiOffers.length > 0) return apiOffers;
    return getOffersForApplication(appId).length > 0 ? getOffersForApplication(appId) : getOffersForApplication('APP-001');
  }, [apiOffers, appId]);

  const sorted = useMemo(() => {
    const copy = [...offers];
    switch (sort) {
      case 'rate': return copy.sort((a, b) => a.apr - b.apr);
      case 'payment': return copy.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
      case 'term': return copy.sort((a, b) => a.termMonths - b.termMonths);
      default: return copy;
    }
  }, [offers, sort]);

  if (!verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  const handleConfirm = async (offer: MockOffer) => {
    const { error } = await apiPost('/api/offers', {
      offerId: offer.id,
      applicationId: offer.applicationId || appId,
      hardPullConsent: true,
    });

    if (error) {
      console.warn('API offer selection failed:', error);
    }

    localStorage.setItem('clp_selected_offer', JSON.stringify(offer));
    localStorage.setItem('clp_demo_app', JSON.stringify(demoApp));
    localStorage.setItem('clp_offer_selected_at', new Date().toISOString());

    toast.success(`Offer from ${offer.lenderName} selected!`);
    router.push('/status');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-gray-500">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/dashboard?token=${token}`} className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href={`/dashboard/status?token=${token}`} className="text-xs text-gray-500 hover:text-gray-900 transition-colors duration-200 cursor-pointer">Application Status</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Pre-Qualification Results</h1>
            <p className="text-sm text-gray-500 mt-1">
              Showing results for {demoApp.vehicle.year} {demoApp.vehicle.make} {demoApp.vehicle.model} -- {formatCurrency(demoApp.loanAmount)}
            </p>
          </div>
          <span className="text-[10px] px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium whitespace-nowrap self-start">
            {offers.length} Offers Available
          </span>
        </div>

        <div className="flex gap-2 mb-8">
          {([['rate', 'Lowest Rate'], ['payment', 'Lowest Payment'], ['term', 'Shortest Term']] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)}
              className={`px-4 py-2 text-xs rounded-lg border transition-colors duration-200 cursor-pointer ${sort === key ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4 mb-10">
          {sorted.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <OfferCard offer={offer} isLowestRate={offer.apr === Math.min(...offers.map(o => o.apr))} lenderTier={lenderTiers[offer.lenderName] || 'prime'} onSelect={setSelectedOffer} />
            </motion.div>
          ))}
        </div>

        <ComparisonTable offers={sorted} />

        {offers.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-gray-500 mb-6">No offers yet. Submit an application first.</p>
            <Link href="/apply" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">Apply Now</Link>
          </div>
        )}
      </div>

      {selectedOffer && (
        <HardPullConsentModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
