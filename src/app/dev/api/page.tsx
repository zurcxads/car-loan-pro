"use client";

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  testPayload?: Record<string, unknown>;
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/api/applications',
    description: 'Submit a new loan application',
    testPayload: {
      personalInfo: {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        ssn: '123-45-6789',
        dob: '1988-05-15',
        email: 'maria.rodriguez.test@autoloanpro.co',
        phone: '(713) 555-0142',
      },
      addressInfo: {
        currentAddressLine1: '4521 Oak Street',
        currentCity: 'Houston',
        currentState: 'TX',
        currentZip: '77001',
        residenceType: 'rent',
        monthlyHousingPayment: 1450,
        monthsAtCurrentAddress: 36,
      },
      employmentInfo: {
        employmentStatus: 'full_time',
        grossMonthlyIncome: 5800,
        monthsAtEmployer: 24,
        incomeTypePrimary: 'employment',
      },
      dealStructure: {
        desiredTermMonths: 60,
        cashDownPayment: 3000,
        hasTradeIn: false,
        gapInsuranceInterest: true,
        extendedWarrantyInterest: false,
      },
      consent: {
        softPullConsent: true,
        hardPullConsent: true,
        tcpaConsent: true,
        termsOfService: true,
        privacyPolicy: true,
        eSignConsent: true,
      },
      hasCoBorrower: false,
    },
  },
  {
    method: 'GET',
    path: '/api/offers',
    description: 'Get all offers for an application',
  },
  {
    method: 'POST',
    path: '/api/offers/[id]/select',
    description: 'Select a specific offer',
    testPayload: {
      offerId: 'offer-1',
      applicationId: 'app-1',
      hardPullConsent: true,
    },
  },
  {
    method: 'GET',
    path: '/api/dashboard',
    description: 'Get dashboard data for current user',
  },
  {
    method: 'GET',
    path: '/api/lenders',
    description: 'Get all active lenders',
  },
  {
    method: 'POST',
    path: '/api/lenders/[lenderId]/decision',
    description: 'Submit lender decision on application',
    testPayload: {
      applicationId: 'app-1',
      decision: 'approve',
      apr: 4.99,
      approvedAmount: 25000,
      termMonths: 60,
    },
  },
  {
    method: 'GET',
    path: '/api/dealers',
    description: 'Get all dealers',
  },
  {
    method: 'POST',
    path: '/api/dealers/[dealerId]/deals',
    description: 'Submit a new deal from dealer',
    testPayload: {
      applicationId: 'app-1',
      offerId: 'offer-1',
      vin: '4T1B11HK9PU123456',
      salePrice: 28500,
      downPayment: 3000,
    },
  },
  {
    method: 'GET',
    path: '/api/admin/stats',
    description: 'Get platform statistics',
  },
  {
    method: 'GET',
    path: '/api/admin/applications',
    description: 'Get all applications (admin)',
  },
  {
    method: 'POST',
    path: '/api/documents/upload',
    description: 'Upload a document',
  },
  {
    method: 'GET',
    path: '/api/notifications',
    description: 'Get user notifications',
  },
  {
    method: 'POST',
    path: '/api/vin/decode',
    description: 'Decode a VIN number',
    testPayload: {
      vin: '4T1B11HK9PU123456',
    },
  },
];

export default function APIExplorerPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [response, setResponse] = useState<{ status?: number; data?: unknown; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<Array<{ time: string; method: string; path: string; status: number }>>([]);

  const testEndpoint = async (endpoint: APIEndpoint) => {
    setLoading(true);
    setResponse(null);

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.testPayload && (endpoint.method === 'POST' || endpoint.method === 'PATCH')) {
        options.body = JSON.stringify(endpoint.testPayload);
      }

      const res = await fetch(endpoint.path, options);
      const data = await res.json();

      setResponse({ status: res.status, data });

      // Add to logs
      setLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          method: endpoint.method,
          path: endpoint.path,
          status: res.status,
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);

      if (res.ok) {
        toast.success(`${endpoint.method} ${endpoint.path} — ${res.status}`);
      } else {
        toast.error(`${endpoint.method} ${endpoint.path} — ${res.status}`);
      }
    } catch (error) {
      setResponse({ error: String(error) });
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold mt-2">API Explorer</h1>
          <p className="text-gray-400 text-sm mt-1">
            Test API endpoints with pre-filled test data
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Endpoint List */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Endpoints</h2>
            <div className="space-y-2">
              {API_ENDPOINTS.map((endpoint, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedEndpoint === endpoint
                      ? 'bg-gray-800 border-blue-600'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      endpoint.method === 'GET' ? 'bg-green-600 text-white' :
                      endpoint.method === 'POST' ? 'bg-blue-600 text-white' :
                      endpoint.method === 'PATCH' ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{endpoint.path}</span>
                  </div>
                  <p className="text-xs text-gray-500">{endpoint.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details & Response */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEndpoint ? (
              <>
                {/* Endpoint Details */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded ${
                          selectedEndpoint.method === 'GET' ? 'bg-green-600 text-white' :
                          selectedEndpoint.method === 'POST' ? 'bg-blue-600 text-white' :
                          selectedEndpoint.method === 'PATCH' ? 'bg-yellow-600 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {selectedEndpoint.method}
                        </span>
                        <h3 className="text-sm font-mono text-gray-300">{selectedEndpoint.path}</h3>
                      </div>
                      <p className="text-sm text-gray-400">{selectedEndpoint.description}</p>
                    </div>
                    <button
                      onClick={() => testEndpoint(selectedEndpoint)}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Testing...' : 'Try It'}
                    </button>
                  </div>

                  {selectedEndpoint.testPayload && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Request Body</div>
                      <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(selectedEndpoint.testPayload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Response */}
                {response && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-300">Response</h3>
                      {response.status && (
                        <span className={`text-xs font-bold px-3 py-1 rounded ${
                          response.status >= 200 && response.status < 300 ? 'bg-green-600 text-white' :
                          response.status >= 400 ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {response.status}
                        </span>
                      )}
                    </div>
                    <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-gray-400 text-sm">Select an endpoint to test</p>
              </div>
            )}

            {/* Recent API Calls Log */}
            {logs.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent API Calls</h3>
                <div className="space-y-2">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-3 bg-gray-950 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-mono">{log.time}</span>
                        <span className={`font-bold px-2 py-0.5 rounded ${
                          log.method === 'GET' ? 'bg-green-600 text-white' :
                          log.method === 'POST' ? 'bg-blue-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {log.method}
                        </span>
                        <span className="text-gray-400 font-mono">{log.path}</span>
                      </div>
                      <span className={`font-bold ${
                        log.status >= 200 && log.status < 300 ? 'text-green-400' :
                        log.status >= 400 ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
