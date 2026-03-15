"use client";

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { showDevTools } from '@/lib/env';

interface StatusStep {
  label: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
}

function StatusContent() {
  const isDev = showDevTools();
  const [application, setApplication] = useState<{ id: string; status: string; submittedAt: string; offersReceived: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDev) {
      setApplication({
        id: 'APP-DEV-001',
        status: 'conditional',
        submittedAt: new Date().toISOString(),
        offersReceived: 3,
      });
      setLoading(false);
      return;
    }

    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.application) {
          setApplication(data.data.application);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [isDev]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading status...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No application found</p>
      </div>
    );
  }

  const steps: StatusStep[] = [
    {
      label: 'Application Submitted',
      status: 'completed',
      date: new Date(application.submittedAt).toLocaleDateString(),
    },
    {
      label: 'Credit Review',
      status: application.status === 'pending_decision' ? 'current' : 'completed',
      date: application.status !== 'pending_decision' ? new Date(application.submittedAt).toLocaleDateString() : undefined,
    },
    {
      label: 'Offers Received',
      status: application.offersReceived > 0 ? 'completed' : application.status === 'pending_decision' ? 'current' : 'pending',
      date: application.offersReceived > 0 ? new Date(application.submittedAt).toLocaleDateString() : undefined,
    },
    {
      label: 'Pre-Approval Letter',
      status: application.status === 'offers_available' && application.offersReceived > 0 ? 'current' : 'pending',
    },
    {
      label: 'Find Your Vehicle',
      status: 'pending',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Status</h1>
        <p className="text-gray-600 mb-8">Application {application.id}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-6">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}

                <div className="relative flex-shrink-0">
                  {step.status === 'completed' ? (
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : step.status === 'current' ? (
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <h3 className={`text-base font-semibold mb-1 ${
                    step.status === 'completed' ? 'text-gray-900' :
                    step.status === 'current' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </h3>
                  {step.date && (
                    <p className="text-sm text-gray-500">{step.date}</p>
                  )}
                  {step.status === 'current' && (
                    <p className="text-sm text-blue-600 mt-2">In Progress</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-blue-900 mb-3">What&apos;s Next?</h2>
          {application.offersReceived > 0 ? (
            <div className="text-sm text-blue-800 space-y-2">
              <p>You have {application.offersReceived} loan offer{application.offersReceived > 1 ? 's' : ''} waiting for you!</p>
              <Link
                href="/results"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                View Your Offers
              </Link>
            </div>
          ) : (
            <p className="text-sm text-blue-800">
              Our lending partners are reviewing your application. You&apos;ll receive offers within 2-15 minutes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <StatusContent />
    </Suspense>
  );
}
