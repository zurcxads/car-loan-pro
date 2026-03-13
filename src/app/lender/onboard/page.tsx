"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  companyName: string;
  lenderType: string;
  nmls: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  minCreditScore: string;
  maxCreditScore: string;
  maxDti: string;
  minRate: string;
  maxRate: string;
  maxLoanAmount: string;
  apiKey: string;
  webhookUrl: string;
}

export default function LenderOnboardPage() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    lenderType: '',
    nmls: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    minCreditScore: '',
    maxCreditScore: '',
    maxDti: '',
    minRate: '',
    maxRate: '',
    maxLoanAmount: '',
    apiKey: 'lp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    webhookUrl: '',
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    console.log('Submitting lender onboarding:', formData);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/lender" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
            Lender Partner Registration
          </h1>
          <p className="text-gray-600">
            Join our network and connect with qualified borrowers
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    s === step
                      ? 'bg-blue-600 text-white scale-110'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                {s < 4 && (
                  <div className={`w-16 sm:w-24 h-1 transition-all ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Company Info</span>
            <span>Underwriting</span>
            <span>Integration</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Steps */}
        <motion.div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Company Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      placeholder="e.g., Capital One Auto Finance"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lender Type</label>
                    <select
                      value={formData.lenderType}
                      onChange={(e) => updateField('lenderType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="bank">Bank</option>
                      <option value="credit_union">Credit Union</option>
                      <option value="online_lender">Online Lender</option>
                      <option value="specialty_finance">Specialty Finance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NMLS Number</label>
                    <input
                      type="text"
                      value={formData.nmls}
                      onChange={(e) => updateField('nmls', e.target.value)}
                      placeholder="e.g., 123456"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="e.g., 123 Main Street"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="ST"
                        maxLength={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateField('zip', e.target.value)}
                      placeholder="12345"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Underwriting Criteria</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Credit Score</label>
                      <input
                        type="number"
                        value={formData.minCreditScore}
                        onChange={(e) => updateField('minCreditScore', e.target.value)}
                        placeholder="e.g., 580"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Credit Score</label>
                      <input
                        type="number"
                        value={formData.maxCreditScore}
                        onChange={(e) => updateField('maxCreditScore', e.target.value)}
                        placeholder="e.g., 850"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum DTI Ratio (%)</label>
                    <input
                      type="number"
                      value={formData.maxDti}
                      onChange={(e) => updateField('maxDti', e.target.value)}
                      placeholder="e.g., 45"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min APR (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.minRate}
                        onChange={(e) => updateField('minRate', e.target.value)}
                        placeholder="e.g., 3.49"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max APR (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.maxRate}
                        onChange={(e) => updateField('maxRate', e.target.value)}
                        placeholder="e.g., 18.99"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Loan Amount</label>
                    <input
                      type="number"
                      value={formData.maxLoanAmount}
                      onChange={(e) => updateField('maxLoanAmount', e.target.value)}
                      placeholder="e.g., 75000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-700">
                      These criteria help us match you with qualified borrowers who fit your lending profile.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Integration Setup</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={formData.apiKey}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(formData.apiKey);
                        }}
                        className="px-4 py-3 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use this API key to authenticate requests to our platform
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.webhookUrl}
                      onChange={(e) => updateField('webhookUrl', e.target.value)}
                      placeholder="https://api.yourcompany.com/webhooks/autoloanpro"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ll send real-time notifications about new applications to this URL
                    </p>
                  </div>
                  <div className="mt-6 p-6 rounded-xl bg-gray-50 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Integration Documentation</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>API Documentation: autoloanpro.com/api-docs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>SDK Libraries: Node.js, Python, PHP, Ruby</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>Support: partners@autoloanpro.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Submit</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Company Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company Name:</span>
                        <span className="font-medium">{formData.companyName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{formData.lenderType.replace('_', ' ') || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">NMLS:</span>
                        <span className="font-medium">{formData.nmls || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-right">
                          {formData.address && formData.city
                            ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Underwriting Criteria</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Credit Score Range:</span>
                        <span className="font-medium">{formData.minCreditScore || '-'} - {formData.maxCreditScore || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max DTI:</span>
                        <span className="font-medium">{formData.maxDti ? `${formData.maxDti}%` : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">APR Range:</span>
                        <span className="font-medium">{formData.minRate || '-'}% - {formData.maxRate || '-'}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Loan Amount:</span>
                        <span className="font-medium">{formData.maxLoanAmount ? `$${parseInt(formData.maxLoanAmount).toLocaleString()}` : '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Integration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="font-mono text-xs">{formData.apiKey.substring(0, 20)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Webhook:</span>
                        <span className="font-medium text-right max-w-xs truncate">{formData.webhookUrl || 'Not configured'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm text-green-700">
                      By submitting this application, you agree to our Lender Partner Terms and acknowledge that all information provided is accurate.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Submit Application
              </button>
            )}
          </div>
        </motion.div>

        {/* Save Draft */}
        <div className="mt-6 text-center">
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            Save Draft and Continue Later
          </button>
        </div>
      </div>
    </div>
  );
}
