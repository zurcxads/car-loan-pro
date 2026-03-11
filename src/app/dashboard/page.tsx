"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Application {
  id: string;
  status: string;
  borrower: {
    firstName: string;
    lastName: string;
  };
  loanAmount: number;
  offersReceived: number;
  submittedAt: string;
}

export default function ConsumerDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/apply');
      return;
    }

    // Fetch application data
    fetch(`/api/dashboard?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setApplication(data.application);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load dashboard');
        setLoading(false);
      });
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
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
    'offers_ready': 'bg-green-100 text-green-700',
    'offer_selected': 'bg-blue-100 text-blue-700',
    'approved': 'bg-green-100 text-green-700',
    'declined': 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    'pending_decision': 'Under Review',
    'offers_ready': 'Offers Ready',
    'offer_selected': 'Offer Selected',
    'approved': 'Approved',
    'declined': 'Declined',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="text-sm text-gray-500">
            Application {application.id}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {application.borrower.firstName}
            </h1>
            <p className="text-gray-500">Here's the status of your auto loan application.</p>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Application Status</div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[application.status] || 'bg-gray-100 text-gray-700'}`}>
                  {statusLabels[application.status] || application.status}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Loan Amount</div>
                <div className="text-xl font-bold text-gray-900">
                  ${application.loanAmount.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Submitted on {new Date(application.submittedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* View Offers */}
            <Link 
              href={`/dashboard/offers?token=${token}`}
              className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                {application.offersReceived > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    {application.offersReceived} Available
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">View Offers</h3>
              <p className="text-sm text-gray-500">
                {application.offersReceived > 0 
                  ? 'Compare loan offers from multiple lenders'
                  : 'Offers will appear here once lenders review your application'}
              </p>
            </Link>

            {/* Application Status */}
            <Link 
              href={`/dashboard/status?token=${token}`}
              className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Application Status</h3>
              <p className="text-sm text-gray-500">Track your application progress and next steps</p>
            </Link>
          </div>

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
                  If you have questions about your application or need assistance, we're here to help.
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
