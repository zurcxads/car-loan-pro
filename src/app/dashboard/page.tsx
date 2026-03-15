"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SkeletonDashboard } from '@/components/shared/Skeleton';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { showDevTools } from '@/lib/env';

type LockedOffer = {
  id: string;
  lenderName: string;
  apr: number;
  monthlyPayment: number;
  approvedAmount: number;
  termMonths: number;
  status: string;
};

interface Application {
  id: string;
  status: string;
  borrower: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  loanAmount?: number;
  hasVehicle: boolean;
  offersReceived: number;
  submittedAt: string;
  offerLockedAt?: string | null;
  offerExpiresAt?: string | null;
  lockedOfferId?: string | null;
  vehicle?: {
    year: number;
    make: string;
    model: string;
  };
  lockedOffer?: LockedOffer | null;
}

type DashboardPayload = {
  application: Application | null;
};

type DashboardApiResponse =
  | { success: true; data: DashboardPayload }
  | { success: false; error?: string };

const STATUS_STYLES: Record<string, string> = {
  offer_accepted: 'bg-emerald-100 text-emerald-700',
  documents_requested: 'bg-orange-100 text-orange-700',
  approved: 'bg-blue-100 text-blue-700',
  funded: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-gray-200 text-gray-700',
  declined: 'bg-red-100 text-red-700',
  pending_decision: 'bg-yellow-100 text-yellow-700',
  offers_available: 'bg-green-100 text-green-700',
  conditional: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS: Record<string, string> = {
  offer_accepted: 'Active',
  documents_requested: 'Documents Needed',
  approved: 'Approved',
  funded: 'Funded',
  expired: 'Expired',
  declined: 'Declined',
  pending_decision: 'Under Review',
  offers_available: 'Offers Ready',
  conditional: 'Under Review',
};

const PROGRESS_STEPS = ['Applied', 'Offer Selected', 'Documents', 'Approved', 'Funded'];

function getProgressIndex(status: string): number {
  switch (status) {
    case 'funded':
      return 4;
    case 'approved':
      return 3;
    case 'documents_requested':
      return 2;
    case 'offer_accepted':
      return 1;
    default:
      return 0;
  }
}

function getNextStepsCopy(status: string): string {
  switch (status) {
    case 'documents_requested':
      return 'Your lender has requested documents. Upload them below.';
    case 'approved':
      return 'Congratulations! Visit your lender to finalize your loan.';
    case 'offer_accepted':
    default:
      return 'Your lender will review your application. You will be notified when they need additional information.';
  }
}

function DashboardContent() {
  const router = useRouter();
  const isDev = showDevTools();
  const cancelDialogRef = useRef<HTMLDivElement>(null);

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  useFocusTrap(showCancelModal, cancelDialogRef, () => setShowCancelModal(false));

  useEffect(() => {
    if (isDev) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 18);
      setApplication({
        id: 'APP-DEV-001',
        status: 'offer_accepted',
        borrower: { firstName: 'John', lastName: 'Smith' },
        loanAmount: 32000,
        hasVehicle: false,
        offersReceived: 3,
        submittedAt: new Date().toISOString(),
        lockedOfferId: 'demo-1',
        offerLockedAt: new Date().toISOString(),
        offerExpiresAt: expiresAt.toISOString(),
        lockedOffer: {
          id: 'demo-1',
          lenderName: 'Capital Auto Finance',
          apr: 4.2,
          monthlyPayment: 465,
          approvedAmount: 32000,
          termMonths: 60,
          status: 'locked',
        },
      });
      setLoading(false);
      return;
    }

    fetch('/api/dashboard', { cache: 'no-store' })
      .then((res) => res.json())
      .then((response: DashboardApiResponse) => {
        if (!response.success) {
          setError(response.error || 'Failed to load dashboard');
          return;
        }

        setApplication(response.data.application);
      })
      .catch(() => {
        setError('Failed to load dashboard');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isDev]);

  const daysRemaining = useMemo(() => {
    if (!application?.offerExpiresAt) return 0;
    const diff = new Date(application.offerExpiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [application?.offerExpiresAt]);

  const handleCancelOffer = async () => {
    if (!application?.lockedOffer) return;

    setCancelSubmitting(true);
    try {
      const response = await fetch('/api/offers/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: application.lockedOffer.id }),
      });
      const payload = (await response.json()) as { success?: boolean };

      if (!response.ok || !payload.success) {
        toast.error('Unable to complete your request.');
        return;
      }

      toast.success('Offer cancelled.');
      setShowCancelModal(false);
      router.refresh();
      window.location.reload();
    } catch {
      toast.error('Unable to complete your request.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Session Expired</h2>
          <p className="mb-6 text-sm text-gray-500">Your session has expired or the link is invalid.</p>
          <Link href="/apply" className="inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
            Start New Application
          </Link>
        </div>
      </div>
    );
  }

  const hasLockedOffer = Boolean(application.lockedOfferId && application.lockedOffer);
  const progressIndex = getProgressIndex(application.status);

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <div className="sticky top-0 z-40 border-b border-[#E3E8EE] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[#0A2540]">Auto Loan Pro</Link>
          <div className="text-sm text-[#6B7C93]">Application {application.id}</div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-[#0A2540]">Welcome back, {application.borrower.firstName}</h1>
          <p className="text-[#6B7C93]">Track your financing progress and manage your application.</p>
        </div>

        {hasLockedOffer ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
            <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Locked Offer</p>
                  <h2 className="text-3xl font-semibold text-[#0A2540]">{application.lockedOffer?.lenderName}</h2>
                  <p className="mt-2 text-sm text-[#6B7C93]">Offer expires in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}.</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[application.status] || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABELS[application.status] || application.status}
                </span>
              </div>

              <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-[#6B7C93]">APR</div>
                  <div className="text-2xl font-semibold text-[#0A2540]">{application.lockedOffer?.apr.toFixed(2)}%</div>
                </div>
                <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-[#6B7C93]">Monthly Payment</div>
                  <div className="text-2xl font-semibold text-[#0A2540]">${application.lockedOffer?.monthlyPayment.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-[#6B7C93]">Loan Amount</div>
                  <div className="text-2xl font-semibold text-[#0A2540]">${application.lockedOffer?.approvedAmount.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-[#6B7C93]">Term</div>
                  <div className="text-2xl font-semibold text-[#0A2540]">{application.lockedOffer?.termMonths} months</div>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  {PROGRESS_STEPS.map((step, index) => (
                    <div key={step} className="flex flex-1 flex-col items-center text-center">
                      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${index <= progressIndex ? 'bg-blue-600 text-white' : 'bg-[#E3E8EE] text-[#6B7C93]'}`}>
                        {index + 1}
                      </div>
                      <div className={`text-xs font-medium ${index <= progressIndex ? 'text-[#0A2540]' : 'text-[#6B7C93]'}`}>{step}</div>
                    </div>
                  ))}
                </div>
                <div className="relative h-2 rounded-full bg-[#E3E8EE]">
                  <div
                    className="absolute left-0 top-0 h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${(progressIndex / (PROGRESS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                Cancel Offer
              </button>
            </section>

            <div className="space-y-6">
              <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Next Steps</p>
                <h2 className="mb-3 text-2xl font-semibold text-[#0A2540]">What happens now</h2>
                <p className="text-sm leading-6 text-[#425466]">{getNextStepsCopy(application.status)}</p>
              </section>

              <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Application Summary</p>
                <div className="space-y-3 text-sm text-[#425466]">
                  <div className="flex items-center justify-between">
                    <span>Submitted</span>
                    <span className="font-medium text-[#0A2540]">{new Date(application.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Vehicle</span>
                    <span className="font-medium text-[#0A2540]">
                      {application.hasVehicle && application.vehicle
                        ? `${application.vehicle.year} ${application.vehicle.make} ${application.vehicle.model}`
                        : 'Open vehicle search'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Offer Expiration</span>
                    <span className="font-medium text-[#0A2540]">
                      {application.offerExpiresAt
                        ? new Date(application.offerExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
            <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Application Status</p>
              <h2 className="mb-3 text-3xl font-semibold text-[#0A2540]">{STATUS_LABELS[application.status] || 'Application In Progress'}</h2>
              <p className="mb-6 text-sm leading-6 text-[#425466]">
                {application.status === 'offers_available'
                  ? 'Your offers are ready. Return to results and choose the lender you want to move forward with.'
                  : 'We are still processing your application and will notify you when the next step is ready.'}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-[#6B7C93]">Offers Received</div>
                  <div className="text-2xl font-semibold text-[#0A2540]">{application.offersReceived}</div>
                </div>
                <div className="rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-[#6B7C93]">Loan Request</div>
                  <div className="text-2xl font-semibold text-[#0A2540]">
                    {application.loanAmount ? `$${application.loanAmount.toLocaleString()}` : 'Pending'}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Actions</p>
              <div className="space-y-3">
                <Link href="/results" className="block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-500">
                  View Offers
                </Link>
                <Link href="/apply" className="block rounded-xl border border-[#D7E3F1] px-4 py-3 text-center text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC]">
                  Start Another Application
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>

      {showCancelModal && hasLockedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} role="presentation">
          <div
            ref={cancelDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-offer-title"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
          >
            <h2 id="cancel-offer-title" className="mb-2 text-2xl font-semibold text-[#0A2540]">Cancel locked offer</h2>
            <p className="mb-6 text-sm leading-6 text-[#425466]">
              Cancelling this offer will unlock your application and let you apply again or choose a different offer later.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-left text-sm font-medium text-[#6B7C93] hover:text-[#0A2540]"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelOffer}
                disabled={cancelSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {cancelSubmitting ? 'Cancelling...' : 'Cancel Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F6F9FC] text-[#6B7C93]">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
