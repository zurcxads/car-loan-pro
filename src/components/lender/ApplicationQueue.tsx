"use client";

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';
import type { MockApplication, MockOffer } from '@/lib/mock-data';
import type { Message } from '@/lib/types';

type ActiveApplication = {
  application: MockApplication;
  lockedOffer: MockOffer;
};

type ActiveApplicationsResponse =
  | { success: true; data: { applications: ActiveApplication[] } }
  | { success: false; error?: string };

const DecisionModal = dynamic(() => import('./DecisionModal'), { ssr: false });

type MessagesApiResponse =
  | { success: true; data: { messages: Message[] } }
  | { success: false; error?: string };

function formatCurrency(value: number | undefined) {
  if (!value) {
    return 'Pre-Approval';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Not locked';
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function maskBorrowerName(app: MockApplication) {
  const firstInitial = app.borrower.firstName.charAt(0).toUpperCase();
  const lastInitial = app.borrower.lastName.charAt(0).toUpperCase();
  return `${firstInitial}*** ${lastInitial}***`;
}

function getStatusLabel(status: string) {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ApplicationQueue({ lenderId }: { lenderId: string | null }) {
  const [search, setSearch] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<ActiveApplication | null>(null);
  const [requestDocsApplication, setRequestDocsApplication] = useState<MockApplication | null>(null);
  const [applications, setApplications] = useState<ActiveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [messageSubmitting, setMessageSubmitting] = useState(false);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      setError('');

      try {
        if (!lenderId) {
          setApplications([]);
          return;
        }

        const response = await fetch('/api/lender/applications', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to load lender applications');
        }

        const payload = await response.json() as ActiveApplicationsResponse;
        if (!payload.success) {
          throw new Error(payload.error || 'Failed to load lender applications');
        }

        setApplications(payload.data.applications);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    }

    void loadApplications();
  }, [lenderId]);

  const filtered = useMemo(() => {
    let filteredApplications = [...applications];
    if (search) {
      const q = search.toLowerCase();
      filteredApplications = filteredApplications.filter(({ application, lockedOffer }) =>
        application.id.toLowerCase().includes(q) ||
        `${application.borrower.firstName} ${application.borrower.lastName}`.toLowerCase().includes(q) ||
        lockedOffer.lenderName.toLowerCase().includes(q)
      );
    }
    return filteredApplications;
  }, [applications, search]);

  const lockedTodayCount = applications.filter(({ application }) => {
    if (!application.offerLockedAt) {
      return false;
    }

    return new Date(application.offerLockedAt).toDateString() === new Date().toDateString();
  }).length;

  const documentRequestedCount = applications.filter(({ application }) => application.status === 'documents_requested').length;
  const activeOfferCount = applications.filter(({ lockedOffer }) => lockedOffer.status === 'locked').length;

  const reloadApplications = async () => {
    const response = await fetch('/api/lender/applications', { cache: 'no-store' });
    const payload = await response.json() as ActiveApplicationsResponse;
    if (!response.ok || !payload.success) {
      throw new Error(payload.success ? 'Failed to load lender applications' : payload.error || 'Failed to load lender applications');
    }

    setApplications(payload.data.applications);
  };

  useEffect(() => {
    async function loadMessages(applicationId: string) {
      setMessagesLoading(true);
      setMessagesError('');

      try {
        const response = await fetch(`/api/messages?applicationId=${encodeURIComponent(applicationId)}`, {
          cache: 'no-store',
        });
        const payload = await response.json() as MessagesApiResponse;

        if (!response.ok || !payload.success) {
          throw new Error(payload.success ? 'Failed to load messages' : payload.error || 'Failed to load messages');
        }

        setMessages(payload.data.messages);
      } catch (loadError) {
        setMessagesError(loadError instanceof Error ? loadError.message : 'Failed to load messages');
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    }

    if (!selectedApplication) {
      setMessages([]);
      setMessagesError('');
      setMessageDraft('');
      setMessagesLoading(false);
      return;
    }

    void loadMessages(selectedApplication.application.id);
  }, [selectedApplication]);

  const handleSendMessage = async () => {
    if (!selectedApplication || !messageDraft.trim()) {
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
          applicationId: selectedApplication.application.id,
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
      <div className="flex items-center justify-center py-24">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#E3E8EE] bg-white p-8 text-center shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-[#0A2540]">Applications unavailable</h3>
        <p className="text-sm text-[#6B7C93]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Active Applications', value: applications.length },
          { label: 'Locked Today', value: lockedTodayCount },
          { label: 'Docs Requested', value: documentRequestedCount },
          { label: 'Locked Offers', value: activeOfferCount },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-[#E3E8EE] bg-white p-4 shadow-sm">
            <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#6B7C93]">{metric.label}</div>
            <div className="text-2xl font-semibold text-[#0A2540]">{metric.value}</div>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-[#E3E8EE] bg-white shadow-sm">
        <div className="border-b border-[#E3E8EE] px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Active Applications</p>
              <h2 className="text-2xl font-semibold text-[#0A2540]">Locked with your lending program</h2>
            </div>
            <div className="w-full max-w-md">
          <label className="sr-only" htmlFor="lender-active-search">Search applications</label>
          <input
            id="lender-active-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by application, borrower, or lender"
            className="w-full rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] placeholder:text-[#6B7C93] focus:border-blue-600 focus:outline-none"
          />
        </div>
          </div>
          <p className="mt-3 text-sm text-[#6B7C93]">
            {filtered.length} application{filtered.length === 1 ? '' : 's'} with a locked offer tied to your lender account.
          </p>
        </div>

        <div className="divide-y divide-[#E3E8EE]">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#6B7C93]">
              {applications.length === 0 ? 'No active locked applications for this lender yet.' : 'No applications match your search.'}
            </div>
          ) : (
            filtered.map(({ application, lockedOffer }) => (
              <article key={application.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C93]">Applicant</div>
                      <div className="mt-1 text-sm font-semibold text-[#0A2540]">{maskBorrowerName(application)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C93]">Loan Amount</div>
                      <div className="mt-1 text-sm font-semibold text-[#0A2540]">{formatCurrency(lockedOffer.approvedAmount || application.loanAmount)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C93]">Date Locked</div>
                      <div className="mt-1 text-sm text-[#0A2540]">{formatDate(application.offerLockedAt || lockedOffer.lockedAt)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C93]">Status</div>
                      <div className="mt-1 text-sm text-[#0A2540]">{getStatusLabel(application.status)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C93]">Offer</div>
                      <div className="mt-1 text-sm text-[#0A2540]">{lockedOffer.apr.toFixed(2)}% / {lockedOffer.termMonths} mo</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRequestDocsApplication(application)}
                      className="inline-flex rounded-xl border border-[#E3E8EE] px-4 py-2.5 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC]"
                    >
                      Request Documents
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedApplication({ application, lockedOffer })}
                      className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#E3E8EE] bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Lender Messaging</p>
          <p className="text-sm leading-6 text-[#425466]">
            Open an application to review the full file. Messaging and document actions will appear inside the detail panel.
          </p>
        </div>
        <div className="rounded-xl border border-[#E3E8EE] bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Locked Offer Monitoring</p>
          <p className="text-sm leading-6 text-[#425466]">
            This queue only shows consumers who locked your offer, keeping the lender portal focused on active post-selection work.
          </p>
        </div>
        <div className="rounded-xl border border-[#E3E8EE] bg-white p-5 shadow-sm">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-blue-600">Ownership Control</p>
          <p className="text-sm leading-6 text-[#425466]">
            Applications are loaded through lender auth and matched to the locked offer owner before being shown here.
          </p>
        </div>
      </section>
      {selectedApplication ? (
        <ApplicationDetailDrawer
          app={selectedApplication.application}
          onClose={() => setSelectedApplication(null)}
          supplementalSections={(
            <section className="mb-6">
              <h3 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-gray-500">Messages</h3>
              <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-4">
                {messagesLoading ? (
                  <div className="rounded-xl border border-[#E3E8EE] bg-white px-4 py-6 text-sm text-[#6B7C93]">
                    Loading messages...
                  </div>
                ) : messagesError ? (
                  <div className="rounded-xl border border-[#E3E8EE] bg-white px-4 py-6 text-sm text-[#6B7C93]">
                    {messagesError}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#E3E8EE] bg-white px-4 py-6 text-sm text-[#6B7C93]">
                    No messages yet. Start the conversation if you need anything from this borrower.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isLenderMessage = message.senderRole === 'lender' || message.senderRole === 'admin';

                      return (
                        <div key={message.id} className={`flex ${isLenderMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isLenderMessage ? 'bg-blue-600 text-white' : 'border border-[#E3E8EE] bg-white text-[#0A2540]'}`}>
                            <p className="leading-6">{message.content}</p>
                            <p className={`mt-2 text-xs ${isLenderMessage ? 'text-blue-100' : 'text-[#6B7C93]'}`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 border-t border-[#E3E8EE] pt-4">
                  <label htmlFor="lender-message-draft" className="mb-2 block text-sm font-medium text-[#0A2540]">
                    Send a message
                  </label>
                  <textarea
                    id="lender-message-draft"
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    rows={3}
                    placeholder="Ask for clarification or give the borrower an update"
                    className="w-full resize-none rounded-xl border border-[#E3E8EE] bg-white px-4 py-3 text-sm text-[#0A2540] outline-none transition focus:border-blue-600"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleSendMessage()}
                      disabled={messageSubmitting || !messageDraft.trim()}
                      className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {messageSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
          footer={(
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="rounded-xl border border-[#E3E8EE] px-4 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequestDocsApplication(selectedApplication.application);
                  setSelectedApplication(null);
                }}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Request Documents
              </button>
            </div>
          )}
        />
      ) : null}
      {requestDocsApplication ? (
        <DecisionModal
          app={requestDocsApplication}
          action="request_docs"
          onClose={() => setRequestDocsApplication(null)}
          onSubmitted={() => {
            void reloadApplications();
          }}
        />
      ) : null}
    </div>
  );
}
