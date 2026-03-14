"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ApprovalLetterData } from '@/lib/approval-letter';
import { useQRCode } from '@/hooks/useQRCode';

function ApprovalLetterContent() {
  const searchParams = useSearchParams();
  const isDev = searchParams.get('dev') === 'true';
  const [letterData, setLetterData] = useState<ApprovalLetterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dev mode: show mock approval letter
    if (isDev) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      setLetterData({
        approvalCode: 'ALP-DEMO-1234',
        lenderName: 'Capital Auto Finance',
        approvedAmount: 42000,
        apr: 4.2,
        termMonths: 60,
        monthlyPayment: 779,
        expiresAt: expiryDate.toISOString(),
        borrowerName: 'Maria Rodriguez',
        applicationId: 'APP-DEMO-001',
        offerId: 'OFFER-DEMO-001',
        generatedAt: new Date().toISOString(),
        conditions: [
          'Proof of income required at closing',
          'Final approval subject to vehicle inspection and appraisal',
          'Down payment of at least 10% recommended for optimal terms'
        ],
      });
      setLoading(false);
      return;
    }

    // Fetch application and selected offer data
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.application?.selectedOffer) {
          const application = data.data.application;
          const selectedOffer = application.selectedOffer;
          const approvalCode = `ALP-${selectedOffer.id}-${Date.now().toString(36).toUpperCase()}`;
          setLetterData({
            approvalCode,
            lenderName: selectedOffer.lenderName,
            approvedAmount: selectedOffer.approvedAmount,
            apr: selectedOffer.apr,
            termMonths: selectedOffer.termMonths,
            monthlyPayment: selectedOffer.monthlyPayment,
            expiresAt: selectedOffer.expiresAt,
            borrowerName: `${application.borrower.firstName} ${application.borrower.lastName}`,
            applicationId: application.id,
            offerId: selectedOffer.id,
            generatedAt: new Date().toISOString(),
            conditions: selectedOffer.conditions || [],
          });
        }
      })
      .catch(err => {
        console.error('Error loading approval letter:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isDev]);

  const verifyUrl = letterData ? `https://autoloanpro.co/verify/${letterData.approvalCode}` : '';
  const { qrCodeUrl } = useQRCode(verifyUrl);

  const handleDownload = async () => {
    try {
      const url = isDev
        ? '/api/approval-letter/pdf?dev=true'
        : '/api/approval-letter/pdf';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `AutoLoanPro-PreApproval-${letterData?.approvalCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // Placeholder for email share functionality
    alert('Email sharing feature coming soon! For now, please download the PDF and send it manually.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading approval letter...</p>
        </div>
      </div>
    );
  }

  if (!letterData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Approval Letter Found</h2>
          <p className="text-gray-500 mb-4">Please select an offer first.</p>
          <Link
            href={isDev ? '/results?dev=true' : '/results'}
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            View Offers
          </Link>
        </div>
      </div>
    );
  }

  const expirationDate = new Date(letterData.expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const now = new Date();
  const expiry = new Date(letterData.expiresAt);
  const isExpired = expiry < now;
  const isActive = !isExpired;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with actions - hidden on print */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={isDev ? '/dashboard?dev=true' : '/dashboard'}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>

            {/* Status Badge */}
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Expired
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleShare}
              className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share via Email
            </button>
          </div>
        </div>
      </div>

      {/* Approval Letter */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-lg p-12 print:border-0 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="text-center mb-12 pb-8 border-b-2 border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Auto Loan Pro</h1>
            <p className="text-sm text-gray-500">Pre-Approval Certificate</p>
          </div>

          {/* Congratulations */}
          <div className="mb-8">
            <div className="inline-flex px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium mb-4">
              ✓ Approved
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Congratulations, {letterData.borrowerName}!
            </h2>
            <p className="text-gray-600">
              You have been pre-approved for an auto loan by {letterData.lenderName}.
            </p>
          </div>

          {/* Approval Details */}
          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Approved Amount</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${letterData.approvedAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">APR</div>
                <div className="text-2xl font-bold text-blue-600">{letterData.apr.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Term</div>
                <div className="text-lg font-semibold text-gray-900">{letterData.termMonths} months</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Est. Monthly Payment</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${letterData.monthlyPayment.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Approval Code</div>
              <div className="font-mono text-sm font-semibold text-gray-900">{letterData.approvalCode}</div>
            </div>
          </div>

          {/* Conditions (if any) */}
          {letterData.conditions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Conditions:</h3>
              <ul className="space-y-2">
                {letterData.conditions.map((condition, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Important Information */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">How to Use This Pre-Approval:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Present this letter to any dealership when shopping for your vehicle</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>The dealer will verify your approval code with {letterData.lenderName}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Shop with confidence knowing your financing is secured</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">4.</span>
                <span>Final loan terms will be confirmed upon vehicle selection and final underwriting</span>
              </li>
            </ol>
          </div>

          {/* Expiration */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-amber-900 mb-1">Valid Until</div>
                <div className="text-sm text-amber-700">{expirationDate}</div>
              </div>
            </div>
          </div>

          {/* Fine Print */}
          <div className="text-xs text-gray-400 space-y-2 pt-8 border-t border-gray-200">
            <p>
              This pre-approval certificate is issued by {letterData.lenderName} and is subject to final underwriting approval.
              The approved amount, APR, and monthly payment are estimates and may vary based on the actual vehicle selected,
              down payment, and trade-in value.
            </p>
            <p>
              This pre-approval does not constitute a commitment to lend. All loans are subject to credit approval and
              verification of information. APR is Annual Percentage Rate. Actual rate may vary based on creditworthiness
              and other factors.
            </p>
            <p className="pt-2">
              <strong>Application ID:</strong> {letterData.applicationId} | <strong>Offer ID:</strong> {letterData.offerId}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mt-8 print:block">
            {qrCodeUrl ? (
              <div className="text-center">
                <Image
                  src={qrCodeUrl}
                  alt="Verification QR Code"
                  width={128}
                  height={128}
                  className="rounded-lg border-2 border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Scan to verify approval
                </p>
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">QR Code</div>
                  <div className="text-xs text-gray-400">Loading...</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ApprovalLetterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <ApprovalLetterContent />
    </Suspense>
  );
}
