"use client";

import Link from 'next/link';
import { TEST_OFFERS } from '@/lib/test-data';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatCurrency, formatAPR } from '@/lib/format-utils';

export default function ComponentGalleryPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dev" className="text-sm text-gray-400 hover:text-white mb-4 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dev Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-2">Component Gallery</h1>
          <p className="text-gray-400 text-sm mt-1">
            Preview all major UI components with mock data
          </p>
        </div>

        <div className="space-y-12">
          {/* Offer Cards */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Offer Cards</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEST_OFFERS.map((offer, idx) => (
                <OfferCardPreview key={offer.id} offer={offer} isLowestRate={idx === 0} />
              ))}
            </div>
          </section>

          {/* Status Badges */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Status Badges</h2>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="approved" />
              <StatusBadge status="pending" />
              <StatusBadge status="conditional" />
              <StatusBadge status="declined" />
              <StatusBadge status="expired" />
              <StatusBadge status="prime" />
              <StatusBadge status="near_prime" />
              <StatusBadge status="subprime" />
              <StatusBadge status="specialty" />
            </div>
          </section>

          {/* Pre-Approval Letter Preview */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Pre-Approval Letter</h2>
            <div className="bg-white text-gray-900 p-8 rounded-xl max-w-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Auto Loan Pre-Approval Letter</h3>
                <p className="text-sm text-gray-500">Valid through {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>

              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="text-xs text-gray-500 mb-1">Applicant</div>
                  <div className="font-semibold">Maria Rodriguez</div>
                </div>

                <div className="border-b pb-4">
                  <div className="text-xs text-gray-500 mb-1">Pre-Approved Amount</div>
                  <div className="text-3xl font-bold text-green-600">$25,500</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Best APR Available</div>
                    <div className="text-xl font-bold">{formatAPR(4.49)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Estimated Monthly</div>
                    <div className="text-xl font-bold">{formatCurrency(476)}</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-600 font-medium mb-1">Valid For</div>
                  <div className="text-sm text-gray-700">30 days from issue date</div>
                </div>
              </div>
            </div>
          </section>

          {/* Application Summary Card */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Application Summary</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Application Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Applicant</span>
                  <span className="text-sm font-medium">Maria Rodriguez</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Monthly Income</span>
                  <span className="text-sm font-medium">{formatCurrency(5800)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Vehicle</span>
                  <span className="text-sm font-medium">2023 Toyota Camry SE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Asking Price</span>
                  <span className="text-sm font-medium">{formatCurrency(28500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Down Payment</span>
                  <span className="text-sm font-medium">{formatCurrency(3000)}</span>
                </div>
                <div className="border-t border-gray-700 pt-4 flex justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <StatusBadge status="approved" />
                </div>
              </div>
            </div>
          </section>

          {/* Stipulation Checklist */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Stipulation Checklist</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
              <div className="space-y-3">
                {[
                  { label: 'Proof of Income (Last 2 pay stubs)', completed: true },
                  { label: 'Proof of Residence (Utility bill)', completed: true },
                  { label: 'Valid Driver\'s License', completed: false },
                  { label: 'Proof of Insurance', completed: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      item.completed ? 'bg-green-600 border-green-600' : 'border-gray-600'
                    }`}>
                      {item.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Document Upload Card */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Document Upload</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
              <h3 className="text-sm font-semibold mb-2">Upload Pay Stub</h3>
              <p className="text-xs text-gray-400 mb-4">Accepted formats: PDF, JPG, PNG (max 10MB)</p>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-600 transition-colors cursor-pointer">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-sm text-gray-300 mb-1">Click to upload or drag and drop</div>
                <div className="text-xs text-gray-500">PDF, JPG or PNG (max. 10MB)</div>
              </div>
            </div>
          </section>

          {/* Status Timeline */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Status Timeline</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
              <div className="space-y-6">
                {[
                  { label: 'Application Submitted', date: '2026-03-13', completed: true },
                  { label: 'Credit Check Completed', date: '2026-03-13', completed: true },
                  { label: 'Offers Generated', date: '2026-03-13', completed: true },
                  { label: 'Offer Selected', date: '2026-03-14', completed: false },
                  { label: 'Final Approval', date: 'Pending', completed: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-600' : 'bg-gray-700'
                      }`}>
                        {item.completed ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-500" />
                        )}
                      </div>
                      {idx < 4 && <div className={`w-0.5 flex-1 mt-2 ${item.completed ? 'bg-green-600' : 'bg-gray-700'}`} style={{ minHeight: '24px' }} />}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className={`text-sm font-medium ${item.completed ? 'text-white' : 'text-gray-400'}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Notification Bell */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Notification Bell</h2>
            <div className="flex gap-6 items-start">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="relative">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    3
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-sm font-semibold">Recent Notifications</h3>
                </div>
                <div>
                  {[
                    { title: 'New offer available', message: 'Capital One Auto has approved your application', time: '5m ago', unread: true },
                    { title: 'Document uploaded', message: 'Your pay stub has been received', time: '1h ago', unread: true },
                    { title: 'Application submitted', message: 'Your application is being reviewed', time: '2h ago', unread: false },
                  ].map((notif, idx) => (
                    <div key={idx} className={`p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${notif.unread ? 'bg-gray-850' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {notif.title}
                            {notif.unread && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{notif.message}</div>
                        </div>
                        <div className="text-xs text-gray-500">{notif.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Simplified OfferCard for preview
function OfferCardPreview({ offer, isLowestRate }: { offer: { lenderName: string; tier: string; apr: number; termMonths: number; monthlyPayment: number; approvedAmount: number; conditions?: string[] }; isLowestRate: boolean }) {
  const tierColors: Record<string, string> = {
    prime: 'bg-green-500',
    near_prime: 'bg-blue-500',
    subprime: 'bg-amber-500',
  };

  const initials = offer.lenderName.split(' ').map((w: string) => w[0]).join('').slice(0, 2);

  return (
    <div className="rounded-2xl bg-white text-gray-900 border border-gray-200 shadow-sm p-6 relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLowestRate ? 'bg-green-500' : 'bg-blue-600'}`} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${tierColors[offer.tier] || 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold`}>
            {initials}
          </div>
          <div>
            <div className="font-semibold text-sm">{offer.lenderName}</div>
            <div className="mt-0.5">
              <StatusBadge status={offer.tier} />
            </div>
          </div>
        </div>
        {isLowestRate && (
          <span className="text-[10px] px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium">
            Best Rate
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">APR</div>
          <div className="text-2xl font-bold text-blue-600">{formatAPR(offer.apr)}</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Term</div>
          <div className="text-xl font-bold">{offer.termMonths} mo</div>
        </div>
        <div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Monthly</div>
          <div className="text-xl font-bold">{formatCurrency(offer.monthlyPayment)}</div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Approved up to <span className="font-semibold text-gray-900">{formatCurrency(offer.approvedAmount)}</span>
      </div>

      {offer.conditions && offer.conditions.length > 0 ? (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4">
          <div className="text-[10px] text-amber-600 font-medium uppercase tracking-wider mb-1.5">Conditions</div>
          <ul className="space-y-1">
            {offer.conditions.slice(0, 2).map((c: string, i: number) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">-</span> {c}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-green-600 font-medium">No conditions</span>
        </div>
      )}

      <button className="w-full px-4 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
        Select This Offer
      </button>
    </div>
  );
}
