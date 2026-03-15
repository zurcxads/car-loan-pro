"use client";

import { useState } from 'react';
import {
  applicationReceivedEmail,
  offersReadyEmail,
  magicLinkEmail,
  approvalLetterEmail,
  documentRequestEmail,
  documentApprovedEmail,
  approvalCompleteEmail,
  rateExpiringEmail,
} from '@/lib/email-templates';

export default function EmailPreviewPage() {
  const [selectedEmail, setSelectedEmail] = useState('application-received');

  const mockData = {
    email: 'john.doe@example.com',
    firstName: 'John',
    applicationId: 'APP-001',
    offerCount: 3,
    magicLink: 'https://autoloanpro.co/dashboard',
    dashboardLink: 'https://autoloanpro.co/dashboard',
    lenderName: 'Premier Auto Lending',
    approvedAmount: 35000,
    apr: 4.99,
    documentsNeeded: ['Proof of Income', 'Bank Statement', 'Proof of Residence'],
    documentType: 'Proof of Income',
    daysRemaining: 7,
  };

  const emails = {
    'application-received': applicationReceivedEmail(
      mockData.email,
      mockData.firstName,
      mockData.applicationId,
      mockData.magicLink
    ),
    'offers-ready': offersReadyEmail(
      mockData.email,
      mockData.firstName,
      mockData.offerCount,
      mockData.magicLink
    ),
    'magic-link': magicLinkEmail(
      mockData.email,
      mockData.firstName,
      mockData.magicLink
    ),
    'offer-selected': approvalLetterEmail(
      mockData.email,
      mockData.firstName,
      mockData.lenderName,
      mockData.approvedAmount,
      mockData.apr,
      mockData.dashboardLink
    ),
    'document-request': documentRequestEmail(
      mockData.email,
      mockData.firstName,
      mockData.documentsNeeded,
      mockData.dashboardLink
    ),
    'document-approved': documentApprovedEmail(
      mockData.email,
      mockData.firstName,
      mockData.documentType,
      mockData.dashboardLink
    ),
    'approval-complete': approvalCompleteEmail(
      mockData.email,
      mockData.firstName,
      mockData.lenderName,
      mockData.approvedAmount,
      mockData.apr,
      mockData.dashboardLink
    ),
    'rate-expiring': rateExpiringEmail(
      mockData.email,
      mockData.firstName,
      mockData.daysRemaining,
      mockData.dashboardLink
    ),
  };

  const emailList = [
    { id: 'application-received', name: '1. Application Received' },
    { id: 'offers-ready', name: '2. Offers Ready' },
    { id: 'offer-selected', name: '3. Offer Selected (Pre-Approved)' },
    { id: 'document-request', name: '4. Documents Requested' },
    { id: 'document-approved', name: '5. Document Approved' },
    { id: 'approval-complete', name: '6. Final Approval Complete' },
    { id: 'rate-expiring', name: '7. Rate Expiring Soon' },
    { id: 'magic-link', name: 'Bonus: Magic Link Login' },
  ];

  const currentEmail = emails[selectedEmail as keyof typeof emails];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Template Preview
          </h1>
          <p className="text-gray-600">
            Preview all 7 lifecycle email templates + magic link
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-8">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Email Templates
              </h2>
              <div className="space-y-1">
                {emailList.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                      ${
                        selectedEmail === email.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {email.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Email Meta */}
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-16">To:</span>
                    <span className="text-gray-900">{currentEmail.to}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-16">Subject:</span>
                    <span className="text-gray-900 font-medium">
                      {currentEmail.subject}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="p-4">
                <iframe
                  srcDoc={currentEmail.html}
                  className="w-full h-[600px] border border-gray-200 rounded-lg"
                  title="Email Preview"
                />
              </div>

              {/* HTML Source (collapsible) */}
              <details className="border-t border-gray-200">
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                  View HTML Source
                </summary>
                <div className="p-4 bg-gray-50">
                  <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-4 rounded border border-gray-200">
                    {currentEmail.html}
                  </pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
