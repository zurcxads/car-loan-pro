"use client";

const statusStyles: Record<string, string> = {
  // Application statuses
  pending_decision: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  offers_available: 'bg-green-500/15 text-green-400 border-green-500/25',
  conditional: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  funded: 'bg-green-500/15 text-green-400 border-green-500/25',
  declined: 'bg-red-500/15 text-red-400 border-red-500/25',
  // Offer statuses
  approved: 'bg-green-500/15 text-green-400 border-green-500/25',
  selected: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  expired: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  pending: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  // Deal statuses
  submitted: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
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
  pending_decision: 'Pending',
  offers_available: 'Offers Available',
  conditional: 'Conditional',
  funded: 'Funded',
  declined: 'Declined',
  approved: 'Approved',
  selected: 'Selected',
  expired: 'Expired',
  pending: 'Pending',
  submitted: 'Submitted',
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
