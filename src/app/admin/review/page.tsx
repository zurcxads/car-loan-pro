"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReviewApplication {
  id: string;
  borrower: { firstName: string; lastName: string; email: string };
  credit: { ficoScore: number };
  status: string;
  submittedAt: string;
  manualReviewRequired: boolean;
  reviewPriority: number;
  stipulationsComplete: boolean;
  hasVehicle: boolean;
}

export default function AdminReviewPage() {
  const [applications, setApplications] = useState<ReviewApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'high_priority'>('pending');

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/review?filter=${filter}`);
      const data = await res.json();
      if (!data.error) {
        setApplications(data.applications || []);
      }
    } catch {
      console.error('Failed to load applications');
    }
    setLoading(false);
  };

  const handleAction = async (appId: string, action: 'approve' | 'decline' | 'request_info') => {
    try {
      await fetch('/api/admin/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, action }),
      });
      fetchApplications();
    } catch {
      alert('Action failed');
    }
  };

  const priorityColors: Record<number, string> = {
    0: 'text-gray-500',
    1: 'text-yellow-600',
    2: 'text-orange-600',
    3: 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold tracking-tight text-gray-900">
            Auto Loan Pro Admin
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-gray-500 hover:text-gray-900">Dashboard</Link>
            <Link href="/admin/settings" className="text-gray-500 hover:text-gray-900">Settings</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Queue</h1>
          <p className="text-gray-500">Applications requiring manual review</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          {[
            { key: 'pending', label: 'Pending Review' },
            { key: 'high_priority', label: 'High Priority' },
            { key: 'all', label: 'All' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No applications pending review</h3>
            <p className="text-sm text-gray-500">All applications have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => (
              <div
                key={app.id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className="animate-fadeIn opacity-0 bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {app.borrower.firstName} {app.borrower.lastName}
                      </h3>
                      {app.reviewPriority > 0 && (
                        <span className={`text-xs font-medium ${priorityColors[app.reviewPriority]}`}>
                          {'⚠'.repeat(app.reviewPriority)} Priority {app.reviewPriority}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Application: {app.id}</div>
                      <div>Email: {app.borrower.email}</div>
                      <div>FICO: {app.credit.ficoScore}</div>
                      <div>Submitted: {new Date(app.submittedAt).toLocaleString()}</div>
                      <div>Type: {app.hasVehicle ? 'With Vehicle' : 'Pre-Approval Only'}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      {app.status}
                    </span>
                    {app.stipulationsComplete ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Docs Complete
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        Docs Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleAction(app.id, 'approve')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(app.id, 'request_info')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Request More Info
                  </button>
                  <button
                    onClick={() => handleAction(app.id, 'decline')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="ml-auto px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
