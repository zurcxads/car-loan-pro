"use client";

import { useState } from 'react';
import Link from 'next/link';
import AdminRouteShell from '@/components/admin/AdminRouteShell';
import PartnerApplicationStatusBadge from '@/components/admin/PartnerApplicationStatusBadge';
import type { PartnerApplicationDetail } from '@/lib/partner-applications';

type UpdateResponse = {
  data?: {
    application?: PartnerApplicationDetail;
    onboarding?: OnboardingSummary;
  };
  error?: string;
  success?: boolean;
};

type OnboardingSummary = {
  authUserId?: string | null;
  entityId?: string | null;
  temporaryPassword?: string | null;
};

function formatDateTime(value: string | null) {
  if (!value) return 'Not reviewed yet';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function PartnerApplicationDetailClient({
  application: initialApplication,
  userLabel,
}: {
  application: PartnerApplicationDetail;
  userLabel?: string;
}) {
  const [application, setApplication] = useState<PartnerApplicationDetail>(initialApplication);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState(initialApplication.rejectionReason ?? '');
  const [approvalSummary, setApprovalSummary] = useState<OnboardingSummary | null>(null);

  async function updateStatus(status: 'approved' | 'rejected') {
    const confirmationMessage = status === 'approved'
      ? 'Approve this application and provision portal access?'
      : 'Reject this application?';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setApprovalSummary(null);

    try {
      const response = await fetch(`/api/admin/partner-applications/${application.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason: status === 'rejected' ? rejectionReason.trim() || undefined : undefined,
          status,
        }),
      });

      const payload = (await response.json()) as UpdateResponse;

      if (!response.ok || payload.success !== true || !payload.data?.application) {
        throw new Error(payload.error || 'Unable to update application.');
      }

      setApplication(payload.data.application);
      setRejectionReason(payload.data.application.rejectionReason ?? '');
      setApprovalSummary(payload.data.onboarding ?? null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update application.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminRouteShell
      title={application.companyName}
      subtitle={`${application.type === 'lender' ? 'Lender' : 'Dealer'} application review`}
      userLabel={userLabel}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[#E3E8EE] bg-white px-6 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Application ID {application.rawId}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-xl font-semibold text-[#0A2540]">{application.companyName}</h2>
              <PartnerApplicationStatusBadge status={application.status} />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Submitted {formatDateTime(application.submittedAt)}
            </p>
          </div>
          <Link
            href="/admin/applications"
            className="rounded-full border border-[#D7E0EA] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to Applications
          </Link>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {approvalSummary?.entityId ? (
          <div className="rounded-[28px] border border-green-200 bg-green-50 px-6 py-5 text-sm text-green-900">
            <div className="font-semibold">Portal access provisioned.</div>
            <div className="mt-2">Entity ID: {approvalSummary.entityId}</div>
            <div className="mt-1">Auth User ID: {approvalSummary.authUserId ?? 'Existing user updated'}</div>
            {approvalSummary.temporaryPassword ? (
              <div className="mt-1">Temporary password: {approvalSummary.temporaryPassword}</div>
            ) : (
              <div className="mt-1">Existing auth user was updated with portal access.</div>
            )}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          {application.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
            >
              <h3 className="text-lg font-semibold text-[#0A2540]">{section.title}</h3>
              <dl className="mt-5 space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="grid gap-1 border-b border-[#F1F5F9] pb-4 last:border-b-0 last:pb-0">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{field.label}</dt>
                    <dd className="text-sm text-slate-700">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <h3 className="text-lg font-semibold text-[#0A2540]">Rejection Reason</h3>
          <p className="mt-2 text-sm text-slate-500">
            Optional. This note is stored with the application when rejected.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={4}
            className="mt-4 w-full rounded-2xl border border-[#D7E0EA] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            placeholder="Add a rejection reason for internal review or outbound follow-up."
          />
        </section>

        <div className="sticky bottom-4 flex flex-wrap justify-end gap-3 rounded-[28px] border border-[#E3E8EE] bg-white px-6 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
          <button
            type="button"
            onClick={() => updateStatus('rejected')}
            disabled={isSubmitting}
            className="rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Working...' : 'Reject'}
          </button>
          <button
            type="button"
            onClick={() => updateStatus('approved')}
            disabled={isSubmitting}
            className="rounded-full bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Working...' : 'Approve'}
          </button>
        </div>
      </div>
    </AdminRouteShell>
  );
}
