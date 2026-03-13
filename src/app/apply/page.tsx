/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { US_STATES, POPULAR_MAKES } from '@/lib/constants';
import { apiPost } from '@/lib/hooks';
import type {
  BorrowerPersonalInfo, AddressInfo, EmploymentInfo, VehicleInfo,
  DealStructure, ConsentInfo, ApplicationType, VehicleCondition,
  ResidenceType, EmploymentStatus, IncomeType,
} from '@/lib/types';

const STEP_NAMES = ['About You', 'Income & Employment', 'Credit Consent', 'Review & Submit'];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-2 font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', error, maxLength, isValid }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: boolean; maxLength?: number; isValid?: boolean;
}) {
  return (
    <div className="relative">
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        className={`w-full px-4 py-3 bg-gray-50 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200`} />
      {isValid && value && !error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; error?: boolean;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-gray-50 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 cursor-pointer ${!value ? 'text-gray-400' : ''}`}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string | React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
      <div className={`mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-gray-400'}`}>
        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className="text-sm text-gray-600 leading-relaxed">{label}</span>
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
        onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
        <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  );
}

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const devParam = urlParams.get('dev');
      const devCookie = document.cookie.split('; ').find(row => row.startsWith('alp_dev_mode='));
      const hasDevMode = devParam === 'true' || devCookie?.split('=')[1] === 'true';
      setIsDevMode(hasDevMode);
    }
  }, []);

  const [personal, setPersonal] = useState<BorrowerPersonalInfo>({ firstName: '', lastName: '', ssn: '', dob: '', email: '', phone: '', preferredLanguage: 'english' });
  const [address, setAddress] = useState<AddressInfo>({ currentAddressLine1: '', currentCity: '', currentState: '', currentZip: '', residenceType: 'rent', monthlyHousingPayment: 0, monthsAtCurrentAddress: 0 });
  const [employment, setEmployment] = useState<EmploymentInfo>({ employmentStatus: 'full_time' as EmploymentStatus, monthsAtEmployer: 0, grossMonthlyIncome: 0, incomeTypePrimary: 'employment' as IncomeType });
  const [vehicle, setVehicle] = useState<VehicleInfo>({ applicationType: 'used_vehicle' as ApplicationType, vehicleCondition: 'used' as VehicleCondition, year: new Date().getFullYear(), make: '', model: '', askingPrice: 0, isPrivateParty: false });
  const [deal, setDeal] = useState<DealStructure>({ cashDownPayment: 0, hasTradeIn: false, desiredTermMonths: 60, gapInsuranceInterest: false, extendedWarrantyInterest: false });
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [coPersonal, setCoPersonal] = useState<BorrowerPersonalInfo>({ firstName: '', lastName: '', ssn: '', dob: '', email: '', phone: '' });
  const [consent, setConsent] = useState<ConsentInfo>({ softPullConsent: false, hardPullConsent: false, tcpaConsent: false, termsOfService: false, privacyPolicy: false, eSignConsent: false });
  const [hasVehicle, setHasVehicle] = useState(false);

  // Auto-fill with test data in dev mode
  useEffect(() => {
    if (isDevMode && step === 0 && !personal.firstName) {
      import('@/lib/test-data').then(({ TEST_PERSONAL_INFO, TEST_ADDRESS_INFO, TEST_EMPLOYMENT_INFO, TEST_VEHICLE_INFO, TEST_DEAL_STRUCTURE, TEST_CONSENT }) => {
        setPersonal(TEST_PERSONAL_INFO);
        setAddress(TEST_ADDRESS_INFO);
        setEmployment(TEST_EMPLOYMENT_INFO);
        setVehicle(TEST_VEHICLE_INFO);
        setDeal(TEST_DEAL_STRUCTURE);
        setConsent(TEST_CONSENT);
      });
    }
  }, [isDevMode, step, personal.firstName]);

  // Format phone as (XXX) XXX-XXXX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  // Format SSN as XXX-XX-XXXX
  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

  // Format ZIP as XXXXX
  const formatZIP = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 5);
  };

  const validateSSN = (ssn: string): boolean => {
    const digits = ssn.replace(/\D/g, '');
    if (digits.length !== 9) return false;
    if (digits === '000000000') return false;
    if (digits.startsWith('9')) return false;
    return true;
  };

  const validate = (): boolean => {
    if (isDevMode) {
      setErrors({});
      return true;
    }

    const e: Record<string, string> = {};
    if (step === 0) {
      // Step 1: About You (Personal + Address)
      if (!personal.firstName.trim()) e.firstName = 'Required';
      if (!personal.lastName.trim()) e.lastName = 'Required';
      if (!personal.ssn || personal.ssn.replace(/\D/g, '').length !== 9) e.ssn = 'Valid SSN required';
      if (!personal.dob) e.dob = 'Required';
      if (!personal.email.includes('@')) e.email = 'Valid email required';
      if (!personal.phone || personal.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid phone required';
      if (!address.currentAddressLine1.trim()) e.address1 = 'Required';
      if (!address.currentCity.trim()) e.city = 'Required';
      if (!address.currentState) e.state = 'Required';
      if (!address.currentZip || address.currentZip.length < 5) e.zip = 'Valid ZIP required';
    } else if (step === 1) {
      // Step 2: Income & Employment
      if (!employment.grossMonthlyIncome || employment.grossMonthlyIncome <= 0) e.income = 'Required';
    } else if (step === 2) {
      // Step 3: Credit Consent
      if (!consent.softPullConsent) e.soft = 'Required';
      if (!consent.hardPullConsent) e.creditCheck = 'Required';
      if (!consent.tcpaConsent) e.tcpa = 'Required';
      if (!consent.termsOfService) e.terms = 'Required';
      if (!consent.privacyPolicy) e.privacy = 'Required';
      if (!consent.eSignConsent) e.esign = 'Required';
    } else if (step === 3) {
      // Step 4: Review & Submit (validate vehicle if present)
      if (hasVehicle) {
        if (!vehicle.make) e.make = 'Required';
        if (!vehicle.model?.trim()) e.model = 'Required';
        if (!vehicle.askingPrice || vehicle.askingPrice <= 0) e.price = 'Required';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 3)); };
  const back = () => setStep(s => Math.max(s - 1, 0));

  const checkDevMode = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === 'true';

  const submitApplication = async () => {
    if (!validate()) return;

    setSubmitting(true);

    // Dev mode: skip API, go straight to results
    if (checkDevMode()) {
      router.push('/results?dev=true');
      return;
    }

    const safeConsent = {
      softPullConsent: consent.softPullConsent || true,
      hardPullConsent: consent.hardPullConsent || false,
      tcpaConsent: consent.tcpaConsent || true,
      termsOfService: consent.termsOfService || true,
      privacyPolicy: consent.privacyPolicy || true,
      eSignConsent: consent.eSignConsent || true,
    };

    const safeDeal = {
      cashDownPayment: deal.cashDownPayment || 0,
      hasTradeIn: deal.hasTradeIn || false,
      desiredTermMonths: deal.desiredTermMonths || 60,
      gapInsuranceInterest: deal.gapInsuranceInterest || false,
      extendedWarrantyInterest: deal.extendedWarrantyInterest || false,
    };

    const payload = {
      personalInfo: personal,
      addressInfo: address,
      employmentInfo: employment,
      vehicleInfo: hasVehicle ? vehicle : undefined,
      dealStructure: safeDeal,
      consent: safeConsent,
      hasCoBorrower,
      coBorrowerInfo: hasCoBorrower ? { ...coPersonal, ...address, ...employment } : undefined,
    };

    const { data, error } = await apiPost<{ id: string }>('/api/applications', payload);

    if (error) {
      toast.error(error);
      setSubmitting(false);
      return;
    }

    if (data) {
      const appData = data as { id: string; sessionToken: string };
      localStorage.setItem('clp_current_app_id', appData.id);

      toast.success('Application submitted! Finding your best rates...');
      setTimeout(() => router.push(`/results?token=${appData.sessionToken}`), 2500);
    }
  };

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-blue-400 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing your application...</h2>
          <p className="text-sm text-gray-500">Matching you with lenders in our network</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="flex items-center gap-3">
            {isDevMode && (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded-full font-medium border border-yellow-200">
                Auto-filled
              </span>
            )}
            <span className="text-xs text-gray-500 font-medium">Step {step + 1} of 4</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{STEP_NAMES[step]}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="flex gap-2">
          {STEP_NAMES.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-gray-200">
              <div className={`h-full rounded-full transition-all duration-500 ${i < step ? 'bg-green-500 w-full' : i === step ? 'bg-blue-600 w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}
            className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">

            {/* STEP 1: About You (Personal + Address) */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">About You</h2>

                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="First Name *" error={errors.firstName}>
                    <Input
                      value={personal.firstName}
                      onChange={v => setPersonal(p => ({ ...p, firstName: v }))}
                      error={!!errors.firstName}
                      isValid={personal.firstName.trim().length > 0}
                    />
                  </Field>
                  <Field label="Last Name *" error={errors.lastName}>
                    <Input
                      value={personal.lastName}
                      onChange={v => setPersonal(p => ({ ...p, lastName: v }))}
                      error={!!errors.lastName}
                      isValid={personal.lastName.trim().length > 0}
                    />
                  </Field>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="SSN *" error={errors.ssn}>
                    <Input
                      value={personal.ssn}
                      onChange={v => setPersonal(p => ({ ...p, ssn: formatSSN(v) }))}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                      error={!!errors.ssn}
                      isValid={validateSSN(personal.ssn)}
                    />
                  </Field>
                  <Field label="Date of Birth *" error={errors.dob}>
                    <Input
                      type="date"
                      value={personal.dob}
                      onChange={v => setPersonal(p => ({ ...p, dob: v }))}
                      error={!!errors.dob}
                      isValid={!!personal.dob}
                    />
                  </Field>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Email *" error={errors.email}>
                    <Input
                      type="email"
                      value={personal.email}
                      onChange={v => setPersonal(p => ({ ...p, email: v }))}
                      error={!!errors.email}
                      isValid={personal.email.includes('@')}
                    />
                  </Field>
                  <Field label="Phone *" error={errors.phone}>
                    <Input
                      type="tel"
                      value={personal.phone}
                      onChange={v => setPersonal(p => ({ ...p, phone: formatPhone(v) }))}
                      placeholder="(XXX) XXX-XXXX"
                      error={!!errors.phone}
                      isValid={personal.phone.replace(/\D/g, '').length === 10}
                    />
                  </Field>
                </div>

                {/* Address */}
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-5">Current Address</h3>

                  <div className="space-y-5">
                    <Field label="Street Address *" error={errors.address1}>
                      <Input
                        value={address.currentAddressLine1}
                        onChange={v => setAddress(a => ({ ...a, currentAddressLine1: v }))}
                        error={!!errors.address1}
                        isValid={address.currentAddressLine1.trim().length > 0}
                      />
                    </Field>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      <div className="col-span-2 md:col-span-2">
                        <Field label="City *" error={errors.city}>
                          <Input
                            value={address.currentCity}
                            onChange={v => setAddress(a => ({ ...a, currentCity: v }))}
                            error={!!errors.city}
                            isValid={address.currentCity.trim().length > 0}
                          />
                        </Field>
                      </div>
                      <Field label="State *" error={errors.state}>
                        <Select
                          value={address.currentState}
                          onChange={v => setAddress(a => ({ ...a, currentState: v }))}
                          options={US_STATES}
                          placeholder="Select"
                          error={!!errors.state}
                        />
                      </Field>
                      <Field label="ZIP *" error={errors.zip}>
                        <Input
                          value={address.currentZip}
                          onChange={v => setAddress(a => ({ ...a, currentZip: formatZIP(v) }))}
                          maxLength={5}
                          error={!!errors.zip}
                          isValid={address.currentZip.length === 5}
                        />
                      </Field>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                      <Field label="Residence Type">
                        <Select
                          value={address.residenceType}
                          onChange={v => setAddress(a => ({ ...a, residenceType: v as ResidenceType }))}
                          options={[{ value: 'own', label: 'Own' }, { value: 'rent', label: 'Rent' }, { value: 'other', label: 'Other' }]}
                        />
                      </Field>
                      <Field label="Monthly Payment ($)">
                        <Input
                          type="number"
                          value={address.monthlyHousingPayment ? String(address.monthlyHousingPayment) : ''}
                          onChange={v => setAddress(a => ({ ...a, monthlyHousingPayment: Number(v) }))}
                          placeholder="1200"
                        />
                      </Field>
                      <Field label="Months at Address">
                        <Input
                          type="number"
                          value={address.monthsAtCurrentAddress ? String(address.monthsAtCurrentAddress) : ''}
                          onChange={v => setAddress(a => ({ ...a, monthsAtCurrentAddress: Number(v) }))}
                          placeholder="24"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Income & Employment */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Income & Employment</h2>

                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Employment Status">
                    <Select
                      value={employment.employmentStatus}
                      onChange={v => setEmployment(e => ({ ...e, employmentStatus: v as EmploymentStatus }))}
                      options={[
                        { value: 'full_time', label: 'Full Time' },
                        { value: 'part_time', label: 'Part Time' },
                        { value: 'self_employed', label: 'Self Employed' },
                        { value: 'retired', label: 'Retired' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                  </Field>
                  <Field label="Gross Monthly Income *" error={errors.income}>
                    <Input
                      type="number"
                      value={employment.grossMonthlyIncome ? String(employment.grossMonthlyIncome) : ''}
                      onChange={v => setEmployment(e => ({ ...e, grossMonthlyIncome: Number(v) }))}
                      placeholder="5000"
                      error={!!errors.income}
                      isValid={employment.grossMonthlyIncome > 0}
                    />
                  </Field>
                </div>

                {(employment.employmentStatus === 'full_time' || employment.employmentStatus === 'part_time') && (
                  <>
                    <div className="grid md:grid-cols-2 gap-5">
                      <Field label="Employer Name">
                        <Input
                          value={employment.employerName || ''}
                          onChange={v => setEmployment(e => ({ ...e, employerName: v }))}
                          isValid={!!employment.employerName}
                        />
                      </Field>
                      <Field label="Months at Current Employer">
                        <Input
                          type="number"
                          value={employment.monthsAtEmployer ? String(employment.monthsAtEmployer) : ''}
                          onChange={v => setEmployment(e => ({ ...e, monthsAtEmployer: Number(v) }))}
                        />
                      </Field>
                    </div>

                    {/* Previous Employer Section - Animated */}
                    <AnimatePresence>
                      {employment.monthsAtEmployer > 0 && employment.monthsAtEmployer < 24 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 border-t border-gray-200 space-y-5">
                            <h3 className="text-sm font-medium text-blue-600">Previous Employer</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                              <Field label="Previous Employer Name">
                                <Input
                                  value={employment.prevEmployerName || ''}
                                  onChange={v => setEmployment(e => ({ ...e, prevEmployerName: v }))}
                                />
                              </Field>
                              <Field label="Months at Previous Employer">
                                <Input
                                  type="number"
                                  value={employment.prevMonthsAtEmployer ? String(employment.prevMonthsAtEmployer) : ''}
                                  onChange={v => setEmployment(e => ({ ...e, prevMonthsAtEmployer: Number(v) }))}
                                />
                              </Field>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: Credit Consent */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Credit Consent</h2>
                <p className="text-sm text-gray-600 mb-6">
                  We&apos;ll use a soft credit pull to match you with lenders. This won&apos;t affect your credit score.
                </p>

                <div className="space-y-5 bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <Checkbox
                    checked={consent.softPullConsent}
                    onChange={v => setConsent(c => ({ ...c, softPullConsent: v }))}
                    label="I consent to a soft credit inquiry to check my credit for pre-qualification."
                  />
                  {errors.soft && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.hardPullConsent}
                    onChange={v => setConsent(c => ({ ...c, hardPullConsent: v }))}
                    label="I understand that selecting a lender may result in a hard credit inquiry by that lender."
                  />
                  {errors.creditCheck && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.tcpaConsent}
                    onChange={v => setConsent(c => ({ ...c, tcpaConsent: v }))}
                    label="I consent to receive communications via phone, email, or SMS regarding my application."
                  />
                  {errors.tcpa && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.termsOfService}
                    onChange={v => setConsent(c => ({ ...c, termsOfService: v }))}
                    label={<>I agree to the <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</Link></>}
                  />
                  {errors.terms && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.privacyPolicy}
                    onChange={v => setConsent(c => ({ ...c, privacyPolicy: v }))}
                    label={<>I agree to the <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</Link></>}
                  />
                  {errors.privacy && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.eSignConsent}
                    onChange={v => setConsent(c => ({ ...c, eSignConsent: v }))}
                    label="I certify that the information I provided is true and accurate."
                  />
                  {errors.esign && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">What You&apos;re Agreeing To</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        We&apos;ll perform a soft credit check to show you personalized offers. This does NOT impact your credit score. Only when you select a specific lender and proceed will there be a hard inquiry.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Submit */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Review & Submit</h2>

                {/* Summary Cards */}
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xs font-medium text-gray-500 mb-3">Personal Information</h3>
                    <p className="text-sm text-gray-900 font-medium">{personal.firstName} {personal.lastName}</p>
                    <p className="text-sm text-gray-600">{personal.email}</p>
                    <p className="text-sm text-gray-600">{personal.phone}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xs font-medium text-gray-500 mb-3">Address</h3>
                    <p className="text-sm text-gray-900">{address.currentAddressLine1}</p>
                    <p className="text-sm text-gray-600">{address.currentCity}, {address.currentState} {address.currentZip}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-xs font-medium text-gray-500 mb-3">Income</h3>
                    <p className="text-sm text-gray-900 font-medium">${employment.grossMonthlyIncome.toLocaleString()} / month</p>
                    {employment.employerName && <p className="text-sm text-gray-600">{employment.employerName}</p>}
                  </div>
                </div>

                {/* Co-Borrower Toggle */}
                <div className="pt-6 border-t border-gray-200">
                  <Toggle checked={hasCoBorrower} onChange={v => setHasCoBorrower(v)} label="Add a co-borrower" />

                  <AnimatePresence>
                    {hasCoBorrower && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 space-y-5">
                          <div className="grid md:grid-cols-2 gap-5">
                            <Field label="First Name">
                              <Input value={coPersonal.firstName} onChange={v => setCoPersonal(p => ({ ...p, firstName: v }))} />
                            </Field>
                            <Field label="Last Name">
                              <Input value={coPersonal.lastName} onChange={v => setCoPersonal(p => ({ ...p, lastName: v }))} />
                            </Field>
                          </div>
                          <div className="grid md:grid-cols-2 gap-5">
                            <Field label="SSN">
                              <Input value={coPersonal.ssn} onChange={v => setCoPersonal(p => ({ ...p, ssn: formatSSN(v) }))} placeholder="XXX-XX-XXXX" maxLength={11} />
                            </Field>
                            <Field label="Date of Birth">
                              <Input type="date" value={coPersonal.dob} onChange={v => setCoPersonal(p => ({ ...p, dob: v }))} />
                            </Field>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Vehicle Toggle */}
                <div className="pt-6 border-t border-gray-200">
                  <Toggle checked={hasVehicle} onChange={v => setHasVehicle(v)} label="I have a specific vehicle in mind" />

                  <AnimatePresence>
                    {hasVehicle && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 space-y-5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            <Field label="Year">
                              <Input type="number" value={String(vehicle.year || new Date().getFullYear())} onChange={v => setVehicle(ve => ({ ...ve, year: Number(v) }))} />
                            </Field>
                            <Field label="Make *" error={errors.make}>
                              <Select value={vehicle.make || ''} onChange={v => setVehicle(ve => ({ ...ve, make: v }))} options={POPULAR_MAKES.map(m => ({ value: m, label: m }))} placeholder="Select" error={!!errors.make} />
                            </Field>
                            <Field label="Model *" error={errors.model}>
                              <Input value={vehicle.model || ''} onChange={v => setVehicle(ve => ({ ...ve, model: v }))} placeholder="Camry" error={!!errors.model} />
                            </Field>
                            <Field label="Price *" error={errors.price}>
                              <Input type="number" value={vehicle.askingPrice ? String(vehicle.askingPrice) : ''} onChange={v => setVehicle(ve => ({ ...ve, askingPrice: Number(v) }))} placeholder="30000" error={!!errors.price} />
                            </Field>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation - Fixed on Mobile */}
        <div className="fixed md:static bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:border-0 md:bg-transparent">
          <div className="max-w-3xl mx-auto px-6 py-4 md:py-0 md:mt-8 md:pb-12 flex justify-between items-center">
            {step > 0 ? (
              <button onClick={back} className="px-6 py-3 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl transition-colors duration-200 cursor-pointer">
                Back
              </button>
            ) : <div />}

            {step === 3 ? (
              <button
                onClick={submitApplication}
                disabled={submitting}
                className="px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors duration-200 cursor-pointer shadow-sm"
              >
                Submit Application
              </button>
            ) : (
              <button
                onClick={next}
                className="px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors duration-200 cursor-pointer shadow-sm"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
