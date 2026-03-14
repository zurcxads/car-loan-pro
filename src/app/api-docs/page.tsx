"use client";

import { useState } from 'react';
import Link from 'next/link';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
  auth: 'Public' | 'Consumer' | 'Lender' | 'Dealer' | 'Admin';
  request?: string;
  response: string;
}

const endpoints: { category: string; endpoints: ApiEndpoint[] }[] = [
  {
    category: 'Applications',
    endpoints: [
      {
        method: 'POST',
        path: '/api/applications',
        description: 'Submit a new auto loan application',
        auth: 'Public',
        request: `{
  "personalInfo": { "firstName": "...", "lastName": "...", "email": "...", ... },
  "addressInfo": { ... },
  "employmentInfo": { ... },
  "vehicleInfo": { ... },
  "dealStructure": { ... }
}`,
        response: `{
  "success": true,
  "data": {
    "id": "APP-001"
  }
}`,
      },
      {
        method: 'GET',
        path: '/api/applications?status=pending_decision',
        description: 'Get all applications (with optional filters)',
        auth: 'Admin',
        response: `{
  "success": true,
  "data": [{ "id": "APP-001", ... }]
}`,
      },
    ],
  },
  {
    category: 'Offers',
    endpoints: [
      {
        method: 'GET',
        path: '/api/offers?applicationId=APP-001',
        description: 'Get offers for an application',
        auth: 'Public',
        response: `{
  "success": true,
  "data": {
    "offers": [
      {
        "id": "OFR-001",
        "lenderName": "Ally Financial",
        "apr": 5.99,
        "termMonths": 60,
        "monthlyPayment": 486.12,
        "approvedAmount": 25000,
        "status": "approved"
      }
    ]
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/offers/[id]/select',
        description: 'Select an offer (generates pre-approval letter)',
        auth: 'Consumer',
        response: `{
  "success": true,
  "data": {
    "message": "Offer selected successfully",
    "approvalToken": "uuid"
  }
}`,
      },
    ],
  },
  {
    category: 'Lender Portal',
    endpoints: [
      {
        method: 'GET',
        path: '/api/lenders/[lenderId]/applications',
        description: 'Get applications matching lender criteria',
        auth: 'Lender',
        response: `{
  "success": true,
  "data": {
    "applications": [...],
    "lender": { ... }
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/lenders/[lenderId]/decision',
        description: 'Make a lending decision (approve/counter/decline)',
        auth: 'Lender',
        request: `{
  "applicationId": "APP-001",
  "decision": "approve",
  "apr": 5.99,
  "termMonths": 60,
  "approvedAmount": 25000,
  "monthlyPayment": 486.12,
  "conditions": ["Proof of insurance required"]
}`,
        response: `{
  "success": true,
  "data": {
    "offer": { "id": "OFR-001", ... }
  }
}`,
      },
      {
        method: 'PATCH',
        path: '/api/lenders/[lenderId]/rules',
        description: 'Update underwriting rules',
        auth: 'Lender',
        request: `{
  "minFico": 620,
  "maxLtv": 120,
  "maxDti": 45
}`,
        response: `{
  "success": true,
  "data": { "rules": { ... } }
}`,
      },
    ],
  },
  {
    category: 'Dealer Portal',
    endpoints: [
      {
        method: 'GET',
        path: '/api/dealers/[dealerId]/buyers',
        description: 'Get pre-approved buyers in dealer area',
        auth: 'Dealer',
        response: `{
  "success": true,
  "data": {
    "buyers": [
      {
        "buyer": {
          "firstName": "Marcus",
          "lastInitial": "J",
          "approvedAmount": 28500,
          "lenderName": "Ally Financial"
        }
      }
    ]
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/dealers/[dealerId]/deals',
        description: 'Create a new deal (finalize purchase)',
        auth: 'Dealer',
        request: `{
  "applicationId": "APP-001",
  "buyerFirstName": "Marcus",
  "buyerLastInitial": "J",
  "vehicle": "2022 Toyota Camry SE",
  "vin": "4T1BF1FK0NU123456",
  "lenderName": "Ally Financial",
  "amount": 28500,
  "rate": 5.99,
  "term": 60,
  "monthlyPayment": 551.23
}`,
        response: `{
  "success": true,
  "data": {
    "deal": { "id": "DEAL-001", ... }
  }
}`,
      },
    ],
  },
  {
    category: 'Admin',
    endpoints: [
      {
        method: 'GET',
        path: '/api/admin/stats',
        description: 'Get platform statistics',
        auth: 'Admin',
        response: `{
  "success": true,
  "data": {
    "totalApplications": 125,
    "totalOffers": 312,
    "totalDealsFunded": 87,
    "activeLenders": 6
  }
}`,
      },
      {
        method: 'GET',
        path: '/api/admin/lenders',
        description: 'Get all lenders',
        auth: 'Admin',
        response: `{
  "success": true,
  "data": { "lenders": [...] }
}`,
      },
      {
        method: 'PATCH',
        path: '/api/admin/lenders',
        description: 'Update a lender',
        auth: 'Admin',
        request: `{
  "lenderId": "LND-001",
  "isActive": true,
  "referralFee": 350
}`,
        response: `{
  "success": true,
  "data": { "lender": { ... } }
}`,
      },
    ],
  },
  {
    category: 'Notifications',
    endpoints: [
      {
        method: 'GET',
        path: '/api/notifications',
        description: 'Get user notifications',
        auth: 'Consumer',
        response: `{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 3
  }
}`,
      },
      {
        method: 'PATCH',
        path: '/api/notifications/[id]/read',
        description: 'Mark notification as read',
        auth: 'Consumer',
        response: `{
  "success": true,
  "data": { "message": "Notification marked as read" }
}`,
      },
    ],
  },
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);

  const methodColors: Record<HttpMethod, string> = {
    GET: 'bg-blue-100 text-blue-700 border-blue-200',
    POST: 'bg-green-100 text-green-700 border-green-200',
    PATCH: 'bg-amber-100 text-amber-700 border-amber-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
  };

  const authColors: Record<string, string> = {
    Public: 'bg-gray-100 text-gray-700',
    Consumer: 'bg-blue-100 text-blue-700',
    Lender: 'bg-purple-100 text-purple-700',
    Dealer: 'bg-green-100 text-green-700',
    Admin: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-500 text-sm font-medium mb-2 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Documentation</h1>
          <p className="text-gray-600">Auto Loan Pro REST API Reference</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Authentication</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>All authenticated endpoints require a valid session token.</p>
                <p className="pt-2"><strong>For API partners:</strong></p>
                <p>Contact us to receive API keys for production integration.</p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <code className="text-xs text-gray-700">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Base URL</h2>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <code className="text-xs text-gray-700">
                  https://autoloanpro.co
                </code>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Rate Limiting</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>100 requests</strong> per minute</p>
                <p><strong>10,000 requests</strong> per day</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Webhooks</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Configure webhooks to receive real-time updates:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• application.submitted</li>
                  <li>• offer.created</li>
                  <li>• offer.selected</li>
                  <li>• deal.funded</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-8 space-y-8">
            {endpoints.map((category) => (
              <div key={category.category}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h2>
                <div className="space-y-3">
                  {category.endpoints.map((endpoint, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 text-xs font-bold rounded border ${methodColors[endpoint.method]}`}
                          >
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${authColors[endpoint.auth]}`}>
                          {endpoint.auth}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{endpoint.description}</p>

                      {selectedEndpoint === endpoint && (
                        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                          {endpoint.request && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-900 mb-2">Request Body</h4>
                              <pre className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs overflow-x-auto">
                                {endpoint.request}
                              </pre>
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Response</h4>
                            <pre className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs overflow-x-auto">
                              {endpoint.response}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* SDKs */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Coming Soon: Official SDKs</h2>
              <p className="text-blue-100 mb-6">
                We&apos;re building official client libraries to make integration even easier.
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-sm font-medium">
                  JavaScript/TypeScript
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-sm font-medium">
                  Python
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-sm font-medium">
                  Ruby
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
