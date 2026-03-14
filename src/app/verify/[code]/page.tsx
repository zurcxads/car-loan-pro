"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/shared/Logo';

interface VerificationStatus {
  valid: boolean;
  expired: boolean;
  used: boolean;
  approvalCode: string;
  borrowerName?: string;
  approvedAmount?: number;
  lenderName?: string;
  expiresAt?: string;
}

export default function VerifyApprovalPage() {
  const params = useParams();
  const code = params.code as string;
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock verification logic
    // In production, this would query the database
    const checkApprovalCode = () => {
      // For demo codes, show as valid
      if (code.startsWith('ALP-DEMO') || code.startsWith('ALP-DEV')) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        setStatus({
          valid: true,
          expired: false,
          used: false,
          approvalCode: code,
          borrowerName: 'Maria Rodriguez',
          approvedAmount: 42000,
          lenderName: 'Capital Auto Finance',
          expiresAt: expiryDate.toISOString(),
        });
      } else {
        // For other codes, show as invalid (would check DB in production)
        setStatus({
          valid: false,
          expired: false,
          used: false,
          approvalCode: code,
        });
      }
      setLoading(false);
    };

    checkApprovalCode();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Verifying approval code...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Unable to verify approval code.</p>
        </div>
      </div>
    );
  }

  const expirationDate = status.expiresAt
    ? new Date(status.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="md" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Status Header */}
          <div className="text-center mb-8">
            {status.valid && !status.expired && !status.used ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Valid Pre-Approval
                </h1>
                <p className="text-gray-600">This approval code is active and verified.</p>
              </>
            ) : status.expired ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Expired Approval</h1>
                <p className="text-gray-600">This pre-approval has expired.</p>
              </>
            ) : status.used ? (
              <>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Used</h1>
                <p className="text-gray-600">This pre-approval has already been used.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Code</h1>
                <p className="text-gray-600">This approval code could not be verified.</p>
              </>
            )}
          </div>

          {/* Approval Details */}
          {status.valid && !status.expired && !status.used && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-6">
                  {status.borrowerName && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Borrower Name
                      </div>
                      <div className="font-semibold text-gray-900">{status.borrowerName}</div>
                    </div>
                  )}
                  {status.approvedAmount && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Approved Amount
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${status.approvedAmount.toLocaleString()}
                      </div>
                    </div>
                  )}
                  {status.lenderName && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Lender
                      </div>
                      <div className="font-semibold text-gray-900">{status.lenderName}</div>
                    </div>
                  )}
                  {expirationDate && (
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Expires On
                      </div>
                      <div className="font-semibold text-gray-900">{expirationDate}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Approval Code
                </div>
                <div className="font-mono text-sm font-semibold text-gray-900">
                  {status.approvalCode}
                </div>
              </div>
            </div>
          )}

          {/* Approval Code (for invalid/expired) */}
          {(!status.valid || status.expired || status.used) && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Approval Code
              </div>
              <div className="font-mono text-sm font-semibold text-gray-900">
                {status.approvalCode}
              </div>
            </div>
          )}

          {/* Footer Message */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-4">
              {status.valid && !status.expired && !status.used
                ? 'Dealerships can contact the lender directly to verify this pre-approval.'
                : 'If you believe this is an error, please contact support@autoloanpro.co'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Return to Home
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Auto Loan Pro Verification System
          </p>
        </div>
      </div>
    </div>
  );
}
