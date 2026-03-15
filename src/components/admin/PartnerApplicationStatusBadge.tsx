"use client";

import type { PartnerApplicationStatus } from '@/lib/partner-applications';

const statusStyles: Record<PartnerApplicationStatus, string> = {
  approved: 'border-green-200 bg-green-50 text-green-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
};

const dotStyles: Record<PartnerApplicationStatus, string> = {
  approved: 'bg-green-500',
  pending: 'bg-amber-500',
  rejected: 'bg-red-500',
};

export default function PartnerApplicationStatusBadge({ status }: { status: PartnerApplicationStatus }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
      <span className={`h-2 w-2 rounded-full ${dotStyles[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
