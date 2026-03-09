"use client";

import { MockOffer } from '@/lib/mock-data';
import { formatCurrency, formatAPR } from '@/lib/format-utils';
import { daysUntil } from '@/lib/format-utils';
import StatusBadge from '@/components/shared/StatusBadge';

interface OfferCardProps {
  offer: MockOffer;
  isLowestRate: boolean;
  lenderTier: string;
  onSelect: (offer: MockOffer) => void;
  onViewDetails?: (offer: MockOffer) => void;
}

export default function OfferCard({ offer, isLowestRate, lenderTier, onSelect, onViewDetails }: OfferCardProps) {
  const expiresIn = daysUntil(offer.expiresAt);
  const initials = offer.lenderName.split(' ').map(w => w[0]).join('').slice(0, 2);

  const tierColors: Record<string, string> = {
    prime: 'bg-green-500',
    near_prime: 'bg-blue-500',
    subprime: 'bg-amber-500',
  };

  return (
    <div className="rounded-2xl surface surface-hover p-6 relative overflow-hidden">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLowestRate ? 'bg-green-500' : 'bg-blue-600'}`} />

      {/* Top section */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${tierColors[lenderTier] || 'bg-zinc-600'} flex items-center justify-center text-white text-xs font-bold`}>
            {initials}
          </div>
          <div>
            <span className="font-semibold text-sm">{offer.lenderName}</span>
            <div className="mt-0.5">
              <StatusBadge status={lenderTier} />
            </div>
          </div>
        </div>
        {isLowestRate && (
          <span className="text-[10px] px-3 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/25 font-medium">
            Best Rate
          </span>
        )}
      </div>

      {/* Center section - metrics */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">APR</div>
          <div className="text-2xl font-bold text-blue-400">{formatAPR(offer.apr)}</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Term</div>
          <div className="text-xl font-bold">{offer.termMonths} months</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Monthly</div>
          <div className="text-xl font-bold">{formatCurrency(offer.monthlyPayment)}</div>
        </div>
      </div>

      {/* Approved amount */}
      <div className="text-sm text-zinc-400 mb-4">
        Approved up to <span className="font-semibold text-zinc-200">{formatCurrency(offer.approvedAmount)}</span>
      </div>

      {/* Conditions */}
      {offer.conditions.length > 0 ? (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-3 mb-4">
          <div className="text-[10px] text-amber-400 font-medium uppercase tracking-wider mb-1.5">Conditions Required</div>
          <ul className="space-y-1">
            {offer.conditions.map((c, i) => (
              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">-</span> {c}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl bg-green-500/5 border border-green-500/15 p-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-xs text-green-400 font-medium">No conditions -- ready to fund</span>
        </div>
      )}

      {/* Expiration */}
      <div className="text-[10px] text-zinc-600 mb-5 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Offer expires in {expiresIn} days
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(offer)}
            className="px-4 py-2.5 text-xs border border-white/10 hover:border-white/20 rounded-xl transition-colors duration-200 cursor-pointer font-medium"
          >
            See Full Details
          </button>
        )}
        <button
          onClick={() => onSelect(offer)}
          className="flex-1 px-4 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors duration-200 cursor-pointer"
        >
          Select This Offer
        </button>
      </div>
    </div>
  );
}
