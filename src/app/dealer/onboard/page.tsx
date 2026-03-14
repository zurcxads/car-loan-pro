"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  dealershipName: string;
  dealerLicense: string;
  brands: string[];
  address: string;
  city: string;
  state: string;
  zip: string;
  primaryContactName: string;
  primaryContactTitle: string;
  phone: string;
  email: string;
  serviceZipCodes: string;
  serviceRadius: string;
  preferredBrands: string;
}

const POPULAR_BRANDS = [
  'Honda', 'Toyota', 'Ford', 'Chevrolet', 'Nissan', 'Jeep', 'RAM',
  'GMC', 'Subaru', 'Hyundai', 'Kia', 'Mazda', 'Volkswagen', 'BMW',
  'Mercedes-Benz', 'Audi', 'Lexus', 'Acura', 'Infiniti'
];

export default function DealerOnboardPage() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    dealershipName: '',
    dealerLicense: '',
    brands: [],
    address: '',
    city: '',
    state: '',
    zip: '',
    primaryContactName: '',
    primaryContactTitle: '',
    phone: '',
    email: '',
    serviceZipCodes: '',
    serviceRadius: '25',
    preferredBrands: '',
  });

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleBrand = (brand: string) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    // TODO: implement dealer onboarding submission
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/dealer" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
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
            Dealer Partner Registration
          </h1>
          <p className="text-gray-600">
            Join our network and connect with pre-approved buyers
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
            <span>Dealership Info</span>
            <span>Contact</span>
            <span>Service Area</span>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Dealership Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dealership Name</label>
                    <input
                      type="text"
                      value={formData.dealershipName}
                      onChange={(e) => updateField('dealershipName', e.target.value)}
                      placeholder="e.g., Houston Honda"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dealer License Number</label>
                    <input
                      type="text"
                      value={formData.dealerLicense}
                      onChange={(e) => updateField('dealerLicense', e.target.value)}
                      placeholder="e.g., TX-12345"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brands Sold (select all that apply)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                      {POPULAR_BRANDS.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.brands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {formData.brands.length > 0 ? formData.brands.join(', ') : 'None'}
                    </p>
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Primary Contact</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.primaryContactName}
                      onChange={(e) => updateField('primaryContactName', e.target.value)}
                      placeholder="e.g., John Smith"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={formData.primaryContactTitle}
                      onChange={(e) => updateField('primaryContactTitle', e.target.value)}
                      placeholder="e.g., General Manager"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="john@houstondealership.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-700">
                      This contact will receive notifications about pre-approved buyers in your area and updates about your account.
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">Service Area & Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (miles)</label>
                    <select
                      value={formData.serviceRadius}
                      onChange={(e) => updateField('serviceRadius', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="10">10 miles</option>
                      <option value="25">25 miles</option>
                      <option value="50">50 miles</option>
                      <option value="75">75 miles</option>
                      <option value="100">100 miles</option>
                      <option value="150">150+ miles</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ll show you pre-approved buyers within this distance from your dealership
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional ZIP Codes (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.serviceZipCodes}
                      onChange={(e) => updateField('serviceZipCodes', e.target.value)}
                      placeholder="e.g., 77001, 77002, 77003"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated ZIP codes you want to prioritize
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Customer Segments (Optional)
                    </label>
                    <textarea
                      value={formData.preferredBrands}
                      onChange={(e) => updateField('preferredBrands', e.target.value)}
                      placeholder="e.g., First-time buyers, luxury buyers, truck buyers, etc."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="mt-6 p-6 rounded-xl bg-gray-50 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">What Happens Next</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Receive daily notifications about pre-approved buyers in your area</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Contact buyers directly with their approval details</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Track your conversion rates and performance metrics</span>
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Dealership Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dealership Name:</span>
                        <span className="font-medium">{formData.dealershipName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">License:</span>
                        <span className="font-medium">{formData.dealerLicense || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brands:</span>
                        <span className="font-medium text-right max-w-xs">
                          {formData.brands.length > 0 ? formData.brands.join(', ') : '-'}
                        </span>
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Primary Contact</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{formData.primaryContactName || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{formData.primaryContactTitle || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{formData.phone || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{formData.email || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Service Area</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Radius:</span>
                        <span className="font-medium">{formData.serviceRadius} miles</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional ZIPs:</span>
                        <span className="font-medium">{formData.serviceZipCodes || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preferences:</span>
                        <span className="font-medium text-right max-w-xs">{formData.preferredBrands || 'None specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="text-sm text-green-700">
                      By submitting this application, you agree to our Dealer Partner Terms and acknowledge that all information provided is accurate.
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
