"use client";

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_APPLICATIONS, MOCK_OFFERS, type MockApplication } from '@/lib/mock-data';
import { isDev as isDevEnvironment } from '@/lib/env';
import { formatCurrency, formatAPR, daysUntil } from '@/lib/format-utils';
import BuyerCard from './BuyerCard';
import StatusBadge from '@/components/shared/StatusBadge';

type Filter = 'all' | 'new' | 'expiring' | 'invited';
type Sort = 'amount' | 'recent' | 'expiring';

interface BuyerInboxProps {
  dealerId: string | null;
  onStartDeal: (app: MockApplication) => void;
}

interface BuyerApiRecord {
  application: MockApplication;
}

export default function BuyerInbox({ dealerId, onStartDeal }: BuyerInboxProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [detailApp, setDetailApp] = useState<MockApplication | null>(null);
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBuyers() {
      setLoading(true);
      setError('');

      try {
        if (!dealerId) {
          setApplications([]);
          return;
        }

        const response = await fetch(`/api/dealers/${dealerId}/buyers`, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load buyers');
        }

        const payload = await response.json();
        const buyers = (payload.data?.buyers || []) as BuyerApiRecord[];
        setApplications(buyers.map((buyer) => buyer.application));
      } catch (fetchError) {
        const isDevMode = isDevEnvironment();
        if (!isDevMode) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load buyers');
        } else {
          setApplications(MOCK_APPLICATIONS);
        }
      } finally {
        setLoading(false);
      }
    }

    loadBuyers();
  }, [dealerId]);

  const buyers = useMemo(() => {
    let apps = applications.filter((app) => app.status === 'offers_available' || app.status === 'conditional' || app.status === 'pending_decision');

    if (filter === 'new') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      apps = apps.filter((app) => new Date(app.submittedAt).getTime() > weekAgo);
    } else if (filter === 'expiring') {
      apps = apps.filter((app) => {
        const offers = MOCK_OFFERS.filter((offer) => offer.applicationId === app.id);
        return offers.some((offer) => daysUntil(offer.expiresAt) < 7);
      });
    } else if (filter === 'invited') {
      apps = apps.filter((app) => invited.has(app.id));
    }

    switch (sort) {
      case 'amount':
        return apps.sort((a, b) => (b.loanAmount || 0) - (a.loanAmount || 0));
      case 'expiring':
        return apps.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
      default:
        return apps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
  }, [applications, filter, sort, invited]);

  if (loading) {
    return <div className="py-12 text-sm text-gray-500">Loading pre-approved buyers...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Buyer inbox unavailable</h3>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Pre-Approved Buyers in Your Market</h2>
        <p className="text-xs text-gray-500">Real buyer records appear here once consumers select an offer.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1">
          {([['all', 'All Active'], ['new', 'New This Week'], ['expiring', 'Expiring Soon'], ['invited', 'Invited']] as [Filter, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${filter === key ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-500'}`}>{label}</button>
          ))}
        </div>
        <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="ml-auto px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
          <option value="amount">Highest Approval</option>
          <option value="recent">Most Recent</option>
          <option value="expiring">Expiring Soonest</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buyers.map((app, index) => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <BuyerCard
              app={app}
              invited={invited.has(app.id)}
              onInvite={() => setInvited((prev) => new Set(prev).add(app.id))}
              onViewDetails={() => setDetailApp(app)}
              onStartDeal={() => onStartDeal(app)}
            />
          </motion.div>
        ))}
      </div>

      {buyers.length === 0 && (
        <div className="py-16 text-center">
          <svg className="w-10 h-10 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <p className="text-sm text-gray-500">No pre-approved buyers are available yet.</p>
        </div>
      )}

      <AnimatePresence>
        {detailApp && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/50" onClick={() => setDetailApp(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-md bg-white border-l border-gray-200 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Buyer Details</h3>
                <button onClick={() => setDetailApp(null)} className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{detailApp.hasVehicle ? 'Approval Amount' : 'Pre-Approved Up To'}</span>
                  <div className="text-2xl font-bold text-blue-600">{detailApp.loanAmount ? formatCurrency(detailApp.loanAmount) : 'See Offers'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-[10px] text-gray-500 block">Credit Tier</span><StatusBadge status={detailApp.credit.scoreTier === 'prime' ? 'prime' : detailApp.credit.scoreTier === 'near_prime' ? 'near_prime' : 'subprime'} /></div>
                  <div><span className="text-[10px] text-gray-500 block">Location</span><span className="font-medium">{detailApp.borrower.city}, {detailApp.borrower.state}</span></div>
                  {detailApp.vehicle && (
                    <>
                      <div><span className="text-[10px] text-gray-500 block">Vehicle</span><span className="font-medium">{detailApp.vehicle.year} {detailApp.vehicle.make} {detailApp.vehicle.model}</span></div>
                      <div><span className="text-[10px] text-gray-500 block">Condition</span><span className="font-medium capitalize">{detailApp.vehicle.condition}</span></div>
                    </>
                  )}
                  {!detailApp.hasVehicle && (
                    <div className="col-span-2 bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg">
                      Pre-approved without a specific vehicle yet.
                    </div>
                  )}
                </div>

                {MOCK_OFFERS.filter((offer) => offer.applicationId === detailApp.id).map((offer) => (
                  <div key={offer.id} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{offer.lenderName}</span>
                      <StatusBadge status={offer.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><span className="text-gray-500">APR</span><div className="font-semibold">{formatAPR(offer.apr)}</div></div>
                      <div><span className="text-gray-500">Amount</span><div className="font-semibold">{formatCurrency(offer.approvedAmount)}</div></div>
                      <div><span className="text-gray-500">Term</span><div className="font-semibold">{offer.termMonths}mo</div></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <button onClick={() => { onStartDeal(detailApp); setDetailApp(null); }} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
                  Start Deal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
