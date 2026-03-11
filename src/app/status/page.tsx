"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MOCK_APPLICATIONS, type MockOffer, type MockApplication } from '@/lib/mock-data';
import { formatCurrency, formatAPR, formatDate, daysUntil } from '@/lib/format-utils';
import { generateApprovalLetter } from '@/lib/generate-approval-letter';
import DocumentUploadCenter from '@/components/status/DocumentUploadCenter';

const PIPELINE = [
  { key: 'received', label: 'Application Received', desc: 'Your application has been submitted and is being processed.' },
  { key: 'reviewed', label: 'Credit Reviewed', desc: 'A soft credit inquiry has been completed to match you with lenders.' },
  { key: 'offers', label: 'Offers Available', desc: 'Lenders have reviewed your application and provided pre-qualification offers.' },
  { key: 'selected', label: 'Offer Selected', desc: 'You have selected an offer. The lender will begin final underwriting.' },
  { key: 'conditions', label: 'Conditions Met', desc: 'All required documents have been submitted and verified.' },
  { key: 'funded', label: 'Funded', desc: 'Your loan has been funded.' },
];

export default function StatusPage() {
  const [app, setApp] = useState<MockApplication | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<MockOffer | null>(null);
  const [activeStep, setActiveStep] = useState(2);
  const [, setConditionsMet] = useState(false);

  useEffect(() => {
    const savedOffer = localStorage.getItem('clp_selected_offer');
    const savedConditions = localStorage.getItem('clp_conditions_met');

    if (savedOffer) {
      setSelectedOffer(JSON.parse(savedOffer));
      setActiveStep(3);
    }
    if (savedConditions === 'true') {
      setConditionsMet(true);
      setActiveStep(4);
    }

    const appId = localStorage.getItem('clp_current_app_id');
    if (appId) {
      fetch(`/api/applications/${appId}`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data) {
            setApp(json.data);
          } else {
            setApp(MOCK_APPLICATIONS[0]);
          }
        })
        .catch(() => setApp(MOCK_APPLICATIONS[0]));
    } else {
      setApp(MOCK_APPLICATIONS[0]);
    }
  }, []);

  const handleDownloadApproval = () => {
    if (!selectedOffer || !app) return;
    generateApprovalLetter({
      firstName: app.borrower.firstName,
      lastName: app.borrower.lastName,
      lenderName: selectedOffer.lenderName,
      approvedAmount: selectedOffer.approvedAmount,
      apr: selectedOffer.apr,
      termMonths: selectedOffer.termMonths,
      monthlyPayment: selectedOffer.monthlyPayment,
      expiresAt: selectedOffer.expiresAt,
      conditions: selectedOffer.conditions,
    });
    toast.success('Approval letter downloaded!');
  };

  const handleConditionsMet = () => {
    setConditionsMet(true);
    setActiveStep(4);
    localStorage.setItem('clp_conditions_met', 'true');
    toast.success('All conditions met! Your loan is being finalized.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/offers" className="text-xs text-gray-500 hover:text-gray-900 transition-colors duration-200 cursor-pointer">View Offers</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Application Status</h1>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 mb-8">
          {PIPELINE.map((step, i) => (
            <div key={step.key} className="flex gap-5">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: i <= activeStep ? 1 : 0.8, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors duration-300 ${
                    i < activeStep ? 'bg-green-500 border-green-500 text-gray-900' :
                    i === activeStep ? 'bg-blue-600 border-blue-600 text-gray-900' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {i < activeStep ? (
                    <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{i + 1}</span>
                  )}
                </motion.div>
                {i < PIPELINE.length - 1 && (
                  <div className={`w-0.5 h-12 ${i < activeStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="pt-1.5 pb-8">
                <div className={`text-sm font-medium ${i <= activeStep ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </div>
                {i === activeStep && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    {step.desc}
                  </motion.p>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedOffer && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-900">Selected Offer</h2>
              <Link href="/offers" className="text-xs text-blue-600 hover:text-blue-500 transition-colors duration-200">View All Offers</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Lender</span>
                <span className="font-semibold text-gray-900">{selectedOffer.lenderName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">APR</span>
                <span className="font-semibold text-blue-600">{formatAPR(selectedOffer.apr)}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Term</span>
                <span className="font-semibold text-gray-900">{selectedOffer.termMonths} mo</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Monthly</span>
                <span className="font-semibold text-gray-900">{formatCurrency(selectedOffer.monthlyPayment)}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Expires</span>
                <span className="font-semibold text-gray-900">{daysUntil(selectedOffer.expiresAt)} days</span>
              </div>
            </div>
          </div>
        )}

        {app && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8 mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-6">Application Details</h2>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div><span className="text-gray-500 text-xs uppercase tracking-wider">Applicant</span><div className="font-medium text-gray-900 mt-1">{app.borrower.firstName} {app.borrower.lastName}</div></div>
              <div><span className="text-gray-500 text-xs uppercase tracking-wider">Application ID</span><div className="font-medium font-mono text-xs text-gray-900 mt-1">{app.id}</div></div>
              <div><span className="text-gray-500 text-xs uppercase tracking-wider">Vehicle</span><div className="font-medium text-gray-900 mt-1">{app.vehicle.year} {app.vehicle.make} {app.vehicle.model}</div></div>
              <div><span className="text-gray-500 text-xs uppercase tracking-wider">Loan Amount</span><div className="font-medium text-gray-900 mt-1">{formatCurrency(app.loanAmount)}</div></div>
              <div><span className="text-gray-500 text-xs uppercase tracking-wider">Submitted</span><div className="font-medium text-gray-900 mt-1">{formatDate(app.submittedAt)}</div></div>
              <div><span className="text-gray-500 text-xs uppercase tracking-wider">Status</span><div className="font-medium text-gray-900 mt-1 capitalize">{app.status.replace(/_/g, ' ')}</div></div>
            </div>
          </div>
        )}

        {selectedOffer && (
          <div className="mb-8">
            <DocumentUploadCenter
              conditions={selectedOffer.conditions}
              appId={app?.id || 'APP-001'}
              onAllUploaded={handleConditionsMet}
            />
          </div>
        )}

        <div className="flex gap-4">
          {selectedOffer && (
            <button onClick={handleDownloadApproval}
              className="px-6 py-3 text-sm text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-colors duration-200 cursor-pointer">
              Download Approval Letter
            </button>
          )}
          <Link href="/offers" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">
            View Offers
          </Link>
        </div>

        {!app && (
          <div className="py-24 text-center">
            <p className="text-gray-500 mb-6">No application found. Start by applying.</p>
            <Link href="/apply" className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer">Apply Now</Link>
          </div>
        )}
      </div>
    </div>
  );
}
