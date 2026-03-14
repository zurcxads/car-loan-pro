"use client";

import { MockApplication, MOCK_OFFERS } from '@/lib/mock-data';
import { formatCurrency, daysUntil, formatRelativeTime } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';

interface BuyerCardProps {
  app: MockApplication;
  invited: boolean;
  onInvite: () => void;
  onViewDetails: () => void;
  onStartDeal: () => void;
}

export default function BuyerCard({ app, invited, onInvite, onViewDetails }: BuyerCardProps) {
  const offers = MOCK_OFFERS.filter(o => o.applicationId === app.id);
  const minRate = offers.length > 0 ? Math.min(...offers.map(o => o.apr)) : 0;
  const maxRate = offers.length > 0 ? Math.max(...offers.map(o => o.apr)) : 0;
  const maxApproval = offers.length > 0 ? Math.max(...offers.map(o => o.approvedAmount)) : (app.loanAmount || 0);
  const minTerm = offers.length > 0 ? Math.min(...offers.map(o => o.termMonths)) : 60;
  const maxTerm = offers.length > 0 ? Math.max(...offers.map(o => o.termMonths)) : 60;
  const expiry = offers.length > 0 ? daysUntil(offers[0].expiresAt) : 30;

  return (
    <div className={`relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 ${invited ? 'border-blue-200 dark:border-blue-900' : ''}`}>
      {invited && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl border-b border-l border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-medium text-blue-600 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
          Invited
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <StatusBadge status={app.credit.scoreTier === 'prime' ? 'prime' : app.credit.scoreTier === 'near_prime' ? 'near_prime' : 'subprime'} />
        <span className="text-[10px] text-gray-500 dark:text-zinc-400">Pre-approved {formatRelativeTime(app.submittedAt)}</span>
        <span className="ml-auto text-[10px] text-gray-400 dark:text-zinc-500">Expires in {expiry} days</span>
      </div>

      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-zinc-400">Approved up to</span>
        <div className="text-2xl font-bold text-blue-600">{formatCurrency(maxApproval)}</div>
      </div>

      <div className="flex gap-6 mb-3 text-sm">
        <div>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400">Rate Range</span>
          <div className="font-semibold text-gray-900 dark:text-zinc-100">{minRate.toFixed(2)}% - {maxRate.toFixed(2)}% APR</div>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400">Term</span>
          <div className="font-semibold text-gray-900 dark:text-zinc-100">{minTerm === maxTerm ? `${minTerm}` : `${minTerm}-${maxTerm}`} months</div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        {app.borrower.zip} ({app.borrower.city} area)
      </div>

      {app.vehicle?.make && (
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /></svg>
          Looking for: {app.vehicle.year} {app.vehicle.make} {app.vehicle.model}
        </div>
      )}

      {!app.hasVehicle && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Pre-approved - No vehicle selected yet
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onViewDetails} className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium transition-colors hover:border-gray-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700">
          View Details
        </button>
        {invited ? (
          <button disabled className="flex-1 cursor-not-allowed rounded-xl bg-gray-200 px-4 py-2.5 text-xs font-medium text-gray-500 dark:bg-zinc-800 dark:text-zinc-500">Invited</button>
        ) : (
          <button onClick={onInvite} className="flex-1 cursor-pointer rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-500">
            Invite to Dealership
          </button>
        )}
      </div>
    </div>
  );
}
