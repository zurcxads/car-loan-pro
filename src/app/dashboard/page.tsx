"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { SkeletonDashboard } from '@/components/shared/Skeleton';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { showDevTools } from '@/lib/env';
import type { DocumentRequest, Message } from '@/lib/types';

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

type DocumentRequestsApiResponse =
  | { success: true; data: { documentRequests: DocumentRequest[]; note?: string } }
  | { success: false; error?: string };

type MessagesApiResponse =
  | { success: true; data: { messages: Message[] } }
  | { success: false; error?: string };

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
  cancelled: 'bg-gray-200 text-gray-700',
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
  cancelled: 'Cancelled',
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
    case 'offer_accepted':
    case 'submitted':
      return 'Your lender is reviewing your application. You will be notified when they need additional information or make a decision.';
    case 'documents_requested':
      return 'Your lender has requested documents. Please upload them in the Documents section below to keep your application moving.';
    case 'under_review':
      return 'Your documents are being reviewed. We will notify you when a decision is made.';
    case 'approved':
      return 'Your loan has been approved. Contact your lender to finalize the paperwork and complete your purchase.';
    case 'funded':
      return 'Your loan has been funded. Thank you for using Auto Loan Pro.';
    case 'declined':
      return 'Unfortunately, this offer was declined. You may submit a new application.';
    case 'expired':
      return 'This offer has expired. You may submit a new application.';
    default:
      return 'Review your offers and select one to proceed.';
  }
}

function NextStepsIcon({ status }: { status: string }) {
  if (status === 'documents_requested') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-current">
          <path d="M10 1.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Zm0 4a1 1 0 0 1 1 1v3.75a1 1 0 1 1-2 0V6.75a1 1 0 0 1 1-1Zm0 8a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Z" />
        </svg>
      </div>
    );
  }

  if (status === 'approved' || status === 'funded') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-current">
          <path d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42 0L4.79 10.66a1 1 0 0 1 1.414-1.414l2.596 2.596 6.493-6.546a1 1 0 0 1 1.41-.006Z" />
        </svg>
      </div>
    );
  }

  if (status === 'declined' || status === 'expired') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-current">
          <path d="M10 1.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5ZM6.97 6.97a.75.75 0 0 1 1.06 0L10 8.94l1.97-1.97a.75.75 0 1 1 1.06 1.06L11.06 10l1.97 1.97a.75.75 0 1 1-1.06 1.06L10 11.06l-1.97 1.97a.75.75 0 1 1-1.06-1.06L8.94 10 6.97 8.03a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-current">
        <path d="M10 1.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Zm0 4a1 1 0 0 1 1 1v.25a1 1 0 1 1-2 0v-.25a1 1 0 0 1 1-1Zm1 8.5H9a1 1 0 1 1 0-2h.25V9.5H9a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1v3.75A1 1 0 0 1 11 14.25Z" />
      </svg>
    </div>
  );
}

function formatDocumentType(type: string): string {
  return type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mergeDocumentRequest(
  documentRequests: DocumentRequest[],
  nextRequest: DocumentRequest
): DocumentRequest[] {
  return documentRequests.map((documentRequest) => (
    documentRequest.id === nextRequest.id ? nextRequest : documentRequest
  ));
}

function formatMessageTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function DashboardContent() {
  const isDev = showDevTools();
  const cancelDialogRef = useRef<HTMLDivElement>(null);
  const documentsSectionRef = useRef<HTMLElement>(null);
  const expiringApplicationIdRef = useRef<string | null>(null);

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [expireSubmitting, setExpireSubmitting] = useState(false);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState('');
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [messageSubmitting, setMessageSubmitting] = useState(false);

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
      setDocumentRequests([
        {
          id: 'doc-request-1',
          applicationId: 'APP-DEV-001',
          type: 'pay_stub',
          status: 'pending',
          requestedAt: new Date().toISOString(),
          deadline: expiresAt.toISOString(),
          notes: 'Upload your two most recent pay stubs.',
        },
        {
          id: 'doc-request-2',
          applicationId: 'APP-DEV-001',
          type: 'drivers_license',
          status: 'uploaded',
          requestedAt: new Date().toISOString(),
          uploadedAt: new Date().toISOString(),
          notes: 'Front and back image accepted.',
          document: {
            fileName: 'drivers-license.pdf',
            fileSize: 248312,
            mimeType: 'application/pdf',
            uploadedAt: new Date().toISOString(),
          },
        },
      ]);
      setMessages([
        {
          id: 'message-1',
          applicationId: 'APP-DEV-001',
          senderId: 'lender-demo',
          senderRole: 'lender',
          content: 'Please upload your most recent pay stub so we can finish underwriting.',
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
        {
          id: 'message-2',
          applicationId: 'APP-DEV-001',
          senderId: 'consumer:APP-DEV-001',
          senderRole: 'consumer',
          content: 'I can upload that today. Do you need both pages?',
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
      ]);
      setDocumentsLoading(false);
      setMessagesLoading(false);
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

  useEffect(() => {
    if (isDev) {
      return;
    }

    if (!application?.id || application.status === 'cancelled' || application.status === 'expired') {
      setDocumentRequests([]);
      setDocumentsLoading(false);
      return;
    }

    setDocumentsLoading(true);
    setDocumentsError('');

    fetch(`/api/documents/requests?applicationId=${encodeURIComponent(application.id)}`, {
      cache: 'no-store',
    })
      .then((response) => response.json().then((payload: DocumentRequestsApiResponse) => ({ response, payload })))
      .then(({ response, payload }) => {
        if (!response.ok || !payload.success) {
          setDocumentsError(payload.success ? 'Failed to load documents' : payload.error || 'Failed to load documents');
          return;
        }

        setDocumentRequests(payload.data.documentRequests);
      })
      .catch(() => {
        setDocumentsError('Failed to load documents');
      })
      .finally(() => {
        setDocumentsLoading(false);
      });
  }, [application?.id, application?.status, isDev]);

  useEffect(() => {
    if (isDev) {
      return;
    }

    if (!application?.id || !application.lockedOfferId || !application.lockedOffer || !application.offerExpiresAt) {
      return;
    }

    const expiresAt = new Date(application.offerExpiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() >= Date.now()) {
      return;
    }

    if (expiringApplicationIdRef.current === application.id) {
      return;
    }

    expiringApplicationIdRef.current = application.id;
    setExpireSubmitting(true);

    fetch('/api/offers/expire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: application.id }),
    })
      .then(async (response) => {
        const payload = await response.json() as { success?: boolean };

        if (!response.ok || !payload.success) {
          throw new Error('Unable to expire offer');
        }

        setApplication((currentApplication) => {
          if (!currentApplication || currentApplication.id !== application.id) {
            return currentApplication;
          }

          return {
            ...currentApplication,
            status: 'expired',
            lockedOfferId: null,
            lockedOffer: null,
            offerLockedAt: null,
          };
        });
      })
      .catch(() => {
        expiringApplicationIdRef.current = null;
        toast.error('Unable to refresh your offer status.');
      })
      .finally(() => {
        setExpireSubmitting(false);
      });
  }, [application, isDev]);

  useEffect(() => {
    if (isDev) {
      return;
    }

    if (!application?.id || application.status === 'cancelled' || application.status === 'expired') {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    setMessagesLoading(true);
    setMessagesError('');

    fetch(`/api/messages?applicationId=${encodeURIComponent(application.id)}`, {
      cache: 'no-store',
    })
      .then((response) => response.json().then((payload: MessagesApiResponse) => ({ response, payload })))
      .then(({ response, payload }) => {
        if (!response.ok || !payload.success) {
          setMessagesError(payload.success ? 'Failed to load messages' : payload.error || 'Failed to load messages');
          return;
        }

        setMessages(payload.data.messages);
      })
      .catch(() => {
        setMessagesError('Failed to load messages');
      })
      .finally(() => {
        setMessagesLoading(false);
      });
  }, [application?.id, application?.status, isDev]);

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

      toast.success('Offer cancelled');
      setShowCancelModal(false);
      setApplication((currentApplication) => {
        if (!currentApplication) {
          return currentApplication;
        }

        return {
          ...currentApplication,
          status: 'cancelled',
          lockedOfferId: null,
          lockedOffer: null,
          offerLockedAt: null,
          offerExpiresAt: null,
        };
      });
      setDocumentRequests([]);
      setMessages([]);
    } catch {
      toast.error('Unable to complete your request.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleUploadDocument = async (requestId: string, file: File | null) => {
    if (!application?.id || !file) {
      return;
    }

    setUploadingRequestId(requestId);

    try {
      const formData = new FormData();
      formData.set('applicationId', application.id);
      formData.set('requestId', requestId);
      formData.set('file', file);

      const response = await fetch('/api/documents/requests', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json() as
        | { success: true; data: { documentRequest?: DocumentRequest; note?: string } }
        | { success: false; error?: string };

      if (!response.ok || !payload.success || !payload.data.documentRequest) {
        toast.error(payload.success ? 'Unable to upload document.' : payload.error || 'Unable to upload document.');
        return;
      }

      setDocumentRequests((currentRequests) => mergeDocumentRequest(currentRequests, payload.data.documentRequest as DocumentRequest));
      toast.success(payload.data.note || 'Document uploaded successfully.');
    } catch {
      toast.error('Unable to upload document.');
    } finally {
      setUploadingRequestId(null);
    }
  };

  const handleSendMessage = async () => {
    if (!application?.id || !messageDraft.trim()) {
      return;
    }

    setMessageSubmitting(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          content: messageDraft.trim(),
        }),
      });

      const payload = await response.json() as
        | { success: true; data: { message: Message } }
        | { success: false; error?: string };

      if (!response.ok || !payload.success) {
        toast.error(payload.success ? 'Unable to send message.' : payload.error || 'Unable to send message.');
        return;
      }

      setMessages((currentMessages) => [...currentMessages, payload.data.message]);
      setMessageDraft('');
    } catch {
      toast.error('Unable to send message.');
    } finally {
      setMessageSubmitting(false);
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
  const isExpiredState = application.status === 'expired';
  const isCancelledState = application.status === 'cancelled';
  const isReapplyState = isExpiredState || isCancelledState;
  const progressIndex = getProgressIndex(application.status);
  const nextStepsCopy = getNextStepsCopy(application.status);

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

        {expireSubmitting && hasLockedOffer ? (
          <section className="rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
            <p className="text-sm text-[#6B7C93]">Refreshing your offer status...</p>
          </section>
        ) : hasLockedOffer ? (
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-sm text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-700"
                >
                  Cancel This Offer
                </button>
              </div>
            </section>

            <div className="space-y-6">
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
              <h2 className="mb-3 text-3xl font-semibold text-[#0A2540]">
                {isCancelledState ? 'No active offer. Ready to apply again?' : STATUS_LABELS[application.status] || 'Application In Progress'}
              </h2>
              <p className="mb-6 text-sm leading-6 text-[#425466]">
                {isExpiredState
                  ? 'This offer has expired. You may submit a new application.'
                  : isCancelledState
                    ? 'You can submit a new application whenever you are ready.'
                    : application.status === 'offers_available'
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
                {!isReapplyState ? (
                  <Link href="/results" className="block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-500">
                    View Offers
                  </Link>
                ) : null}
                <Link href="/apply" className="block rounded-xl border border-[#D7E3F1] px-4 py-3 text-center text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC]">
                  Start New Application
                </Link>
              </div>
            </section>
          </div>
        )}

        {!isReapplyState ? (
          <>
            <section className="mt-6 rounded-xl border border-[#E3E8EE] bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <NextStepsIcon status={application.status} />
              <div>
                <h2 className="text-lg font-semibold text-[#0A2540]">Next Steps</h2>
                <p className="mt-2 text-sm leading-6 text-[#425466]">{nextStepsCopy}</p>
              </div>
            </div>
            {application.status === 'documents_requested' ? (
              <button
                type="button"
                onClick={() => documentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#D7E3F1] px-4 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC]"
              >
                View Documents
              </button>
            ) : null}
          </div>
            </section>

            <section ref={documentsSectionRef} className="mt-6 rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Documents</p>
              <h2 className="text-2xl font-semibold text-[#0A2540]">Requested documents</h2>
            </div>
            <p className="text-sm text-[#6B7C93]">Upload the items your lender needs to keep your application moving.</p>
          </div>

          {documentsLoading ? (
            <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-6 text-sm text-[#6B7C93]">
              Loading documents...
            </div>
          ) : documentsError ? (
            <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-6 text-sm text-[#6B7C93]">
              {documentsError}
            </div>
          ) : documentRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E3E8EE] bg-[#F6F9FC] px-4 py-8 text-center text-sm text-[#6B7C93]">
              No documents requested yet
            </div>
          ) : (
            <div className="grid gap-4">
              {documentRequests.map((documentRequest) => {
                const isUploaded = documentRequest.status === 'uploaded' || documentRequest.status === 'approved' || documentRequest.status === 'reviewed';

                return (
                  <article
                    key={documentRequest.id}
                    className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#0A2540]">{formatDocumentType(documentRequest.type)}</h3>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isUploaded ? 'bg-blue-100 text-blue-700' : 'bg-[#E3E8EE] text-[#425466]'}`}>
                            {isUploaded ? 'Uploaded' : 'Pending'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-[#425466]">
                          <p>
                            Requested {new Date(documentRequest.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p>
                            Deadline {documentRequest.deadline
                              ? new Date(documentRequest.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Not set'}
                          </p>
                          {documentRequest.notes ? <p>{documentRequest.notes}</p> : null}
                          {documentRequest.document?.fileName ? (
                            <p className="inline-flex items-center gap-2 text-blue-700">
                              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                                <path d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42 0L4.79 10.66a1 1 0 0 1 1.414-1.414l2.596 2.596 6.493-6.546a1 1 0 0 1 1.41-.006Z" />
                              </svg>
                              {documentRequest.document.fileName}
                            </p>
                          ) : null}
                          {documentRequest.document?.uploadPending ? (
                            <p className="text-xs text-[#6B7C93]">
                              Upload metadata is saved. Configure the Supabase Storage bucket to persist the file itself.
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
                        {uploadingRequestId === documentRequest.id ? 'Uploading...' : isUploaded ? 'Replace file' : 'Upload file'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          className="hidden"
                          disabled={uploadingRequestId === documentRequest.id}
                          onChange={(event) => {
                            const nextFile = event.target.files?.[0] ?? null;
                            void handleUploadDocument(documentRequest.id, nextFile);
                            event.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
            </section>

            <section className="mt-6 rounded-[28px] border border-[#E3E8EE] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Messages</p>
            <h2 className="text-2xl font-semibold text-[#0A2540]">Conversation with your lender</h2>
          </div>

          {messagesLoading ? (
            <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-6 text-sm text-[#6B7C93]">
              Loading messages...
            </div>
          ) : messagesError ? (
            <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-6 text-sm text-[#6B7C93]">
              {messagesError}
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E3E8EE] bg-[#F6F9FC] px-4 py-8 text-center text-sm text-[#6B7C93]">
              No messages yet. Your lender will reach out here if they need anything.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isConsumerMessage = message.senderRole === 'consumer';

                return (
                  <div
                    key={message.id}
                    className={`flex ${isConsumerMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[70%] ${
                        isConsumerMessage
                          ? 'bg-blue-600 text-white'
                          : 'border border-[#E3E8EE] bg-[#F6F9FC] text-[#0A2540]'
                      }`}
                    >
                      <p className="leading-6">{message.content}</p>
                      <p className={`mt-2 text-xs ${isConsumerMessage ? 'text-blue-100' : 'text-[#6B7C93]'}`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-[#E3E8EE] pt-6 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="dashboard-message" className="mb-2 block text-sm font-medium text-[#0A2540]">
                Send a message
              </label>
              <textarea
                id="dashboard-message"
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                placeholder="Type your message"
                rows={3}
                className="w-full rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleSendMessage()}
              disabled={messageSubmitting || !messageDraft.trim()}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {messageSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
            </section>
          </>
        ) : null}
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
            <h2 id="cancel-offer-title" className="mb-2 text-2xl font-semibold text-[#0A2540]">Cancel Your Offer</h2>
            <p className="mb-6 text-sm leading-6 text-[#425466]">
              Are you sure you want to cancel your offer with {application.lockedOffer?.lenderName}? This action cannot be undone. You will be able to submit a new application after cancellation.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="inline-flex items-center justify-center rounded-xl border border-[#D7E3F1] bg-[#F6F9FC] px-5 py-3 text-sm font-semibold text-[#425466] transition-colors hover:bg-[#EEF4FB]"
              >
                Keep My Offer
              </button>
              <button
                type="button"
                onClick={handleCancelOffer}
                disabled={cancelSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {cancelSubmitting ? 'Cancelling...' : 'Yes, Cancel Offer'}
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
