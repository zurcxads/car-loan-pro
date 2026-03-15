"use client";

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MockOffer } from '@/lib/mock-data';
import { showDevTools } from '@/lib/env';

const OfferSelectionModal = dynamic(() => import('@/components/offers/OfferSelectionModal'), {
  ssr: false,
});

function OffersContent() {
  const router = useRouter();
  const isDev = showDevTools();
  const [offers, setOffers] = useState<MockOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<MockOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (isDev) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setOffers([
        {
          id: 'demo-1',
          applicationId: 'APP-DEV-001',
          lenderId: 'LND-001',
          lenderName: 'Capital Auto Finance',
          apr: 4.2,
          termMonths: 60,
          monthlyPayment: 589,
          approvedAmount: 32000,
          status: 'approved',
          conditions: ['Proof of income at closing'],
          decisionAt: new Date().toISOString(),
          expiresAt,
        },
        {
          id: 'demo-2',
          applicationId: 'APP-DEV-001',
          lenderId: 'LND-002',
          lenderName: 'Pioneer Credit Union',
          apr: 5.1,
          termMonths: 72,
          monthlyPayment: 515,
          approvedAmount: 31500,
          status: 'conditional',
          conditions: ['Recent paystub', 'Proof of residence'],
          decisionAt: new Date().toISOString(),
          expiresAt,
        },
      ]);
      setLoading(false);
      return;
    }

    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOffers(data.data?.offers || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [isDev]);

  const handleSelectOffer = (offer: MockOffer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleConfirmSelection = async () => {
    if (!selectedOffer) return;

    setIsSelecting(true);

    if (isDev) {
      setTimeout(() => {
        toast.success('Offer selected successfully!');
        setIsModalOpen(false);
        router.push('/dashboard');
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/offers/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: selectedOffer.id,
          selectedTerm: selectedOffer.termMonths,
          selectedDownPayment: 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Offer selected successfully!');
        setIsModalOpen(false);

        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        toast.error(data.error || 'Failed to select offer');
      }
    } catch {
      // Error handled by UI state
      toast.error('Failed to select offer');
    } finally {
      setIsSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Loan Offers</h1>

        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviewing Your Application</h3>
            <p className="text-gray-500">Our lending partners are reviewing your application. Offers typically arrive within 2-15 minutes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{offer.lenderName}</h3>
                    <span className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'approved' ? 'bg-green-100 text-green-700' :
                      offer.status === 'conditional' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {offer.status === 'approved' ? 'Approved' : offer.status === 'conditional' ? 'Conditionally Approved' : offer.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{offer.apr.toFixed(2)}%</div>
                    <div className="text-xs text-gray-500">APR</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Monthly Payment</div>
                    <div className="text-lg font-semibold text-gray-900">${offer.monthlyPayment.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Approved Amount</div>
                    <div className="text-lg font-semibold text-gray-900">${offer.approvedAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Term</div>
                    <div className="text-lg font-semibold text-gray-900">{offer.termMonths} months</div>
                  </div>
                </div>

                {offer.conditions && offer.conditions.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Conditions:</div>
                    <ul className="space-y-1">
                      {offer.conditions.map((condition, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Expires {new Date(offer.expiresAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleSelectOffer(offer)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Select This Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Modal */}
      {selectedOffer && (
        <OfferSelectionModal
          offer={selectedOffer}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSelection}
          loading={isSelecting}
        />
      )}
    </div>
  );
}

export default function OffersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <OffersContent />
    </Suspense>
  );
}
