"use client";

const statusStyles: Record<string, string> = {
  // Application statuses
  draft: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
  submitted: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  offers_ready: 'bg-green-500/15 text-green-400 border-green-500/25',
  offer_accepted: 'bg-green-500/15 text-green-400 border-green-500/25',
  documents_requested: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  under_review: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  approved: 'bg-green-500/15 text-green-400 border-green-500/25',
  funded: 'bg-green-500/15 text-green-400 border-green-500/25',
  declined: 'bg-red-500/15 text-red-400 border-red-500/25',
  cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  // Offer statuses
  selected: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  expired: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  pending: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  // Deal statuses
  lender_review: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  approved_for_funding: 'bg-green-500/15 text-green-400 border-green-500/25',
  wire_sent: 'bg-green-500/15 text-green-400 border-green-500/25',
  // Lender tiers
  prime: 'bg-green-500/15 text-green-400 border-green-500/25',
  near_prime: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  subprime: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  // Admin
  active: 'bg-green-500/15 text-green-400 border-green-500/25',
  inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/25',
  sent: 'bg-green-500/15 text-green-400 border-green-500/25',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  processing: 'Processing',
  offers_ready: 'Offers Ready',
  offer_accepted: 'Offer Accepted',
  documents_requested: 'Documents Requested',
  under_review: 'Under Review',
  approved: 'Approved',
  funded: 'Funded',
  declined: 'Declined',
  cancelled: 'Cancelled',
  selected: 'Selected',
  expired: 'Expired',
  pending: 'Pending',
  lender_review: 'Lender Review',
  approved_for_funding: 'Approved',
  wire_sent: 'Wire Sent',
  prime: 'Prime',
  near_prime: 'Near-Prime',
  subprime: 'Subprime',
  active: 'Active',
  inactive: 'Inactive',
  overdue: 'Overdue',
  sent: 'Sent',
};

export default function StatusBadge({ status, label }: { status: string; label?: string }) {
  const style = statusStyles[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/25';
  const displayLabel = label || statusLabels[status] || status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>
      {displayLabel}
    </span>
  );
}
