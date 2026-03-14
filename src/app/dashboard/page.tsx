"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SkeletonDashboard } from '@/components/shared/Skeleton';
import { isDev as isDevEnvironment } from '@/lib/env';

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
  vehicle?: {
    year: number;
    make: string;
    model: string;
  };
  selectedOffer?: {
    id: string;
    lenderName: string;
    apr: number;
    approvedAmount: number;
  } | null;
}

function DashboardContent() {
  const router = useRouter();
  const isDev = isDevEnvironment();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(30);

  // Calculate days remaining for pre-approval expiration
  useEffect(() => {
    if (application) {
      const submittedDate = new Date(application.submittedAt);
      const expirationDate = new Date(submittedDate);
      expirationDate.setDate(expirationDate.getDate() + 30);
      const today = new Date();
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, diffDays));
    }
  }, [application]);

  useEffect(() => {
    // Dev mode: show mock data
    if (isDev) {
      setApplication({
        id: 'APP-DEV-001',
        status: 'conditional',
        borrower: {
          firstName: 'John',
          lastName: 'Smith',
        },
        loanAmount: 32000,
        hasVehicle: false,
        offersReceived: 3,
        submittedAt: new Date().toISOString(),
        selectedOffer: {
          id: 'demo-1',
          lenderName: 'Capital Auto Finance',
          apr: 4.2,
          approvedAmount: 32000,
        },
      });
      setLoading(false);
      return;
    }

    // Fetch application data
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          setError(data.error || 'Failed to load dashboard');
        } else {
          setApplication(data.data?.application || null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dashboard');
        setLoading(false);
      });
  }, [router, isDev]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-sm text-gray-500 mb-6">Your session has expired or the link is invalid.</p>
          <Link href="/apply" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">
            Start New Application
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    'pending_decision': 'bg-yellow-100 text-yellow-700',
    'offers_available': 'bg-green-100 text-green-700',
    'conditional': 'bg-blue-100 text-blue-700',
    'funded': 'bg-green-100 text-green-700',
    'declined': 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    'pending_decision': 'Under Review',
    'offers_available': 'Offers Ready',
    'conditional': 'Offer Selected',
    'funded': 'Funded',
    'declined': 'Declined',
  };

  const progressWidth = application.status === 'funded'
    ? '100%'
    : application.status === 'conditional'
      ? '75%'
      : application.status === 'offers_available'
        ? '50%'
        : application.status === 'declined'
          ? '25%'
          : '25%';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex text-sm text-gray-500">
              Application {application.id}
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {application.borrower.firstName}
            </h1>
            <p className="text-gray-600">Track your pre-approval and manage your application</p>
          </div>

          {/* Status Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white shadow-xl"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-blue-100 mb-0.5">Your Pre-Approval</div>
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white/20 border border-white/30">
                      {statusLabels[application.status] || application.status}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-5xl font-bold mb-2">
                    {application.loanAmount ? `$${application.loanAmount.toLocaleString()}` : 'Up to $35,000'}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {application.hasVehicle
                      ? `${application.vehicle?.year} ${application.vehicle?.make} ${application.vehicle?.model}`
                      : 'Pre-approved for any vehicle'}
                  </div>
                </div>

                {!application.hasVehicle && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-white">
                      <strong>Blank Check Pre-Approval</strong> — Shop at any dealer with confidence. Your rate is locked for {daysRemaining} days.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
                  <div className="text-sm text-blue-100 mb-2">Expires in</div>
                  <div className="text-4xl font-bold mb-1">{daysRemaining}</div>
                  <div className="text-sm text-blue-100">days</div>
                  <div className="mt-4 text-xs text-blue-200">
                    {new Date(new Date(application.submittedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Progress</h2>
            <div className="relative">
              {/* Progress bar background */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
              <div className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500" style={{ width: progressWidth }} />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                {[
                  { label: 'Applied', completed: true },
                  { label: 'Matched', completed: application.status !== 'pending_decision' && application.status !== 'declined' },
                  { label: 'Pre-Approved', completed: application.status === 'conditional' || application.status === 'funded' },
                  { label: 'Documents', completed: application.status === 'funded' },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 border-2 transition-all ${
                      step.completed
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <div className={`text-xs font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* What's Next Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-2">What&apos;s Next?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {!application.hasVehicle && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">→</span>
                        <span><strong>Find your vehicle:</strong> Visit any dealer or browse online listings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">→</span>
                        <span><strong>Show your letter:</strong> Download your pre-approval letter to present at the dealer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">→</span>
                        <span><strong>Finalize your loan:</strong> Once you choose a vehicle, we&apos;ll complete your funding</span>
                      </li>
                    </>
                  )}
                  {application.hasVehicle && application.status !== 'funded' && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">→</span>
                        <span><strong>Upload documents:</strong> Provide proof of income and insurance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">→</span>
                        <span><strong>Final approval:</strong> We&apos;re reviewing your application (2-3 business days)</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">
                    {application.selectedOffer ? 'Offer Selected' : 'Application Update'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {application.selectedOffer
                      ? `You selected ${application.selectedOffer.lenderName} at ${application.selectedOffer.apr}% APR`
                      : 'Your dashboard is connected to your active application session'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">Offers Ready</div>
                  <div className="text-xs text-gray-500">{application.offersReceived} personalized offers available to review</div>
                  <div className="text-xs text-gray-400 mt-1">1 day ago</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 mb-0.5">Application Submitted</div>
                  <div className="text-xs text-gray-500">Your application has been received and is under review</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(application.submittedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Grid - Single column on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* View Offers */}
              <Link
                href="/results"
                className="block bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  {application.offersReceived > 0 && (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                      {application.offersReceived} New
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">View Offers</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {application.offersReceived > 0
                    ? application.selectedOffer
                      ? 'Review the offers tied to your current pre-approval'
                      : 'Compare rates and terms from multiple lenders'
                    : 'Check back soon for personalized offers'}
                </p>
              </Link>

              {/* Approval Letter */}
              <Link
                href="/dashboard/approval-letter"
                className="block bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-green-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  {application.hasVehicle ? 'Approval Letter' : 'Pre-Approval Letter'}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Download PDF to present at dealerships
                </p>
              </Link>

              {/* Documents */}
              <Link
                href="/dashboard/documents"
                className="block bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-purple-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-200">
                    Optional
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">Upload Documents</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Speed up approval with proof of income
                </p>
              </Link>

              {/* Add Vehicle (if pre-approval without vehicle) */}
              {!application.hasVehicle && (
                <Link
                  href="/dashboard/add-vehicle"
                  className="block bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl border-2 border-blue-600 p-5 hover:from-blue-500 hover:to-blue-600 hover:shadow-xl transition-all group md:col-span-2 lg:col-span-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="px-2.5 py-1 bg-white/20 text-white text-xs font-semibold rounded-full border border-white/30">
                      New
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">Add Vehicle Info</h3>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    Found your car? Add details to finalize loan
                  </p>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have questions about your application or need assistance, we&apos;re here to help.
                </p>
                <div className="flex gap-4 text-sm">
                  <a href="mailto:support@autoloanpro.co" className="text-blue-600 hover:text-blue-700 font-medium">
                    Email Support
                  </a>
                  <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                    Visit Help Center
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConsumerDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading dashboard...</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
