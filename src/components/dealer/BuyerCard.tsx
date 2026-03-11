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
  const maxApproval = offers.length > 0 ? Math.max(...offers.map(o => o.approvedAmount)) : app.loanAmount;
  const minTerm = offers.length > 0 ? Math.min(...offers.map(o => o.termMonths)) : 60;
  const maxTerm = offers.length > 0 ? Math.max(...offers.map(o => o.termMonths)) : 60;
  const expiry = offers.length > 0 ? daysUntil(offers[0].expiresAt) : 30;

  return (
    <div className={`rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 relative ${invited ? 'border-green-200' : ''}`}>
      {invited && (
        <div className="absolute top-0 right-0 bg-green-50 text-green-600 text-[10px] font-medium px-3 py-1 rounded-bl-xl rounded-tr-2xl border-b border-l border-green-200">
          Invited
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <StatusBadge status={app.credit.scoreTier === 'prime' ? 'prime' : app.credit.scoreTier === 'near_prime' ? 'near_prime' : 'subprime'} />
        <span className="text-[10px] text-gray-500">Pre-approved {formatRelativeTime(app.submittedAt)}</span>
        <span className="text-[10px] text-gray-400 ml-auto">Expires in {expiry} days</span>
      </div>

      <div className="mb-3">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Approved up to</span>
        <div className="text-2xl font-bold text-blue-600">{formatCurrency(maxApproval)}</div>
      </div>

      <div className="flex gap-6 mb-3 text-sm">
        <div>
          <span className="text-[10px] text-gray-500">Rate Range</span>
          <div className="font-semibold">{minRate.toFixed(2)}% - {maxRate.toFixed(2)}% APR</div>
        </div>
        <div>
          <span className="text-[10px] text-gray-500">Term</span>
          <div className="font-semibold">{minTerm === maxTerm ? `${minTerm}` : `${minTerm}-${maxTerm}`} months</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        {app.borrower.zip} ({app.borrower.city} area)
      </div>

      {app.vehicle.make && (
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /></svg>
          Looking for: {app.vehicle.year} {app.vehicle.make} {app.vehicle.model}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onViewDetails} className="px-4 py-2.5 text-xs border border-gray-200 hover:border-gray-300 rounded-xl transition-colors cursor-pointer font-medium">
          View Details
        </button>
        {invited ? (
          <button disabled className="flex-1 px-4 py-2.5 text-xs bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed font-medium">Invited</button>
        ) : (
          <button onClick={onInvite} className="flex-1 px-4 py-2.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors cursor-pointer font-medium">
            Invite to Dealership
          </button>
        )}
      </div>
    </div>
  );
}
