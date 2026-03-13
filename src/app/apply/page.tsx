"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { US_STATES, POPULAR_MAKES, TERM_OPTIONS } from '@/lib/constants';
import { apiPost } from '@/lib/hooks';
import type {
  BorrowerPersonalInfo, AddressInfo, EmploymentInfo, VehicleInfo,
  DealStructure, ConsentInfo, ApplicationType, VehicleCondition,
  ResidenceType, EmploymentStatus, IncomeType,
} from '@/lib/types';

const STEP_NAMES = ['Personal Info', 'Address', 'Employment', 'Vehicle', 'Deal Structure', 'Co-Borrower', 'Consent'];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-2 font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', error, maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: boolean; maxLength?: number;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
      className={`w-full px-4 py-3 bg-gray-50 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200`} />
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
        {checked && <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
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

const STORAGE_KEY = 'clp_saved_application';

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);

  const [personal, setPersonal] = useState<BorrowerPersonalInfo>({ firstName: '', lastName: '', ssn: '', dob: '', email: '', phone: '', preferredLanguage: 'english' });
  const [address, setAddress] = useState<AddressInfo>({ currentAddressLine1: '', currentCity: '', currentState: '', currentZip: '', residenceType: 'rent', monthlyHousingPayment: 0, monthsAtCurrentAddress: 0 });
  const [employment, setEmployment] = useState<EmploymentInfo>({ employmentStatus: 'full_time' as EmploymentStatus, monthsAtEmployer: 0, grossMonthlyIncome: 0, incomeTypePrimary: 'employment' as IncomeType });
  const [vehicle, setVehicle] = useState<VehicleInfo>({ applicationType: 'used_vehicle' as ApplicationType, vehicleCondition: 'used' as VehicleCondition, year: new Date().getFullYear(), make: '', model: '', askingPrice: 0, isPrivateParty: false });
  const [deal, setDeal] = useState<DealStructure>({ cashDownPayment: 0, hasTradeIn: false, desiredTermMonths: 60, gapInsuranceInterest: false, extendedWarrantyInterest: false });
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [coPersonal, setCoPersonal] = useState<BorrowerPersonalInfo>({ firstName: '', lastName: '', ssn: '', dob: '', email: '', phone: '' });
  const [consent, setConsent] = useState<ConsentInfo>({ softPullConsent: false, hardPullConsent: false, tcpaConsent: false, termsOfService: false, privacyPolicy: false, eSignConsent: false });

  // Load saved data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const savedTime = data.savedAt || 0;
          const hoursSince = (Date.now() - savedTime) / (1000 * 60 * 60);

          // Show resume banner if saved within last 7 days
          if (hoursSince < 168 && data.step > 0) {
            setHasSavedData(true);
            setShowResumeBanner(true);
          }
        } catch (e) {
          console.error('Failed to load saved application:', e);
        }
      }
    }
  }, []);

  // Auto-save on step change
  useEffect(() => {
    if (typeof window !== 'undefined' && step > 0) {
      const saveData = {
        step,
        personal,
        address,
        employment,
        vehicle,
        deal,
        hasCoBorrower,
        coPersonal,
        consent,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }
  }, [step, personal, address, employment, vehicle, deal, hasCoBorrower, coPersonal, consent]);

  const resumeApplication = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setStep(data.step || 0);
          setPersonal(data.personal || personal);
          setAddress(data.address || address);
          setEmployment(data.employment || employment);
          setVehicle(data.vehicle || vehicle);
          setDeal(data.deal || deal);
          setHasCoBorrower(data.hasCoBorrower || false);
          setCoPersonal(data.coPersonal || coPersonal);
          setConsent(data.consent || consent);
          setShowResumeBanner(false);
          toast.success('Application resumed');
        } catch {
          toast.error('Failed to resume application');
        }
      }
    }
  };

  const startFresh = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      setShowResumeBanner(false);
      toast.success('Starting fresh application');
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!personal.firstName.trim()) e.firstName = 'Required';
      if (!personal.lastName.trim()) e.lastName = 'Required';
      if (!personal.ssn || personal.ssn.replace(/\D/g, '').length !== 9) e.ssn = 'Valid SSN required';
      if (!personal.dob) e.dob = 'Required';
      if (!personal.email.includes('@')) e.email = 'Valid email required';
      if (!personal.phone || personal.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid phone required';
    } else if (step === 1) {
      if (!address.currentAddressLine1.trim()) e.address1 = 'Required';
      if (!address.currentCity.trim()) e.city = 'Required';
      if (!address.currentState) e.state = 'Required';
      if (!address.currentZip || address.currentZip.length < 5) e.zip = 'Valid ZIP required';
    } else if (step === 2) {
      if (!employment.grossMonthlyIncome || employment.grossMonthlyIncome <= 0) e.income = 'Required';
    } else if (step === 3) {
      if (!vehicle.make) e.make = 'Required';
      if (!vehicle.model.trim()) e.model = 'Required';
      if (!vehicle.askingPrice || vehicle.askingPrice <= 0) e.price = 'Required';
    } else if (step === 6) {
      if (!consent.termsOfService) e.terms = 'Required';
      if (!consent.softPullConsent) e.soft = 'Required';
      if (!consent.hardPullConsent) e.creditCheck = 'Required';
      if (!consent.tcpaConsent) e.tcpa = 'Required';
      if (!consent.eSignConsent) e.esign = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 6)); };
  const back = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      personalInfo: personal,
      addressInfo: address,
      employmentInfo: employment,
      vehicleInfo: vehicle,
      dealStructure: deal,
      consent,
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
      localStorage.removeItem(STORAGE_KEY); // Clear saved draft

      toast.success('Application submitted! Finding your best rates...');
      setTimeout(() => router.push(`/dashboard?token=${appData.sessionToken}`), 2500);
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
            <span className="text-xs text-gray-500 font-medium">Step {step + 1} of 7</span>
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

        {/* Resume Banner */}
        {showResumeBanner && hasSavedData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Resume Your Application?</h3>
                <p className="text-xs text-gray-600 mb-3">We found a saved application from your previous visit. Would you like to continue where you left off?</p>
                <div className="flex gap-2">
                  <button
                    onClick={resumeApplication}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Resume Application
                  </button>
                  <button
                    onClick={startFresh}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}
            className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">

            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid sm:grid-cols-3 gap-5">
                  <Field label="First Name *" error={errors.firstName}><Input value={personal.firstName} onChange={v => setPersonal(p => ({ ...p, firstName: v }))} error={!!errors.firstName} /></Field>
                  <Field label="Middle Name"><Input value={personal.middleName || ''} onChange={v => setPersonal(p => ({ ...p, middleName: v }))} /></Field>
                  <Field label="Last Name *" error={errors.lastName}><Input value={personal.lastName} onChange={v => setPersonal(p => ({ ...p, lastName: v }))} error={!!errors.lastName} /></Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Suffix"><Select value={personal.suffix || ''} onChange={v => setPersonal(p => ({ ...p, suffix: v }))} options={[{ value: 'Jr', label: 'Jr.' }, { value: 'Sr', label: 'Sr.' }, { value: 'II', label: 'II' }, { value: 'III', label: 'III' }, { value: 'IV', label: 'IV' }]} placeholder="None" /></Field>
                  <Field label="SSN *" error={errors.ssn}><Input value={personal.ssn} onChange={v => setPersonal(p => ({ ...p, ssn: v }))} placeholder="###-##-####" maxLength={11} error={!!errors.ssn} /></Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Date of Birth *" error={errors.dob}><Input type="date" value={personal.dob} onChange={v => setPersonal(p => ({ ...p, dob: v }))} error={!!errors.dob} /></Field>
                  <Field label="Preferred Language"><Select value={personal.preferredLanguage || 'english'} onChange={v => setPersonal(p => ({ ...p, preferredLanguage: v as 'english' | 'spanish' | 'other' }))} options={[{ value: 'english', label: 'English' }, { value: 'spanish', label: 'Spanish' }, { value: 'other', label: 'Other' }]} /></Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Driver's License Number"><Input value={personal.driversLicenseNumber || ''} onChange={v => setPersonal(p => ({ ...p, driversLicenseNumber: v }))} /></Field>
                  <Field label="DL State"><Select value={personal.driversLicenseState || ''} onChange={v => setPersonal(p => ({ ...p, driversLicenseState: v }))} options={US_STATES} placeholder="Select state" /></Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Email *" error={errors.email}><Input type="email" value={personal.email} onChange={v => setPersonal(p => ({ ...p, email: v }))} error={!!errors.email} /></Field>
                  <Field label="Phone *" error={errors.phone}><Input type="tel" value={personal.phone} onChange={v => setPersonal(p => ({ ...p, phone: v }))} placeholder="(555) 123-4567" error={!!errors.phone} /></Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Address</h2>
                <Field label="Street Address *" error={errors.address1}><Input value={address.currentAddressLine1} onChange={v => setAddress(a => ({ ...a, currentAddressLine1: v }))} error={!!errors.address1} /></Field>
                <Field label="Apt / Suite / Unit"><Input value={address.currentAddressLine2 || ''} onChange={v => setAddress(a => ({ ...a, currentAddressLine2: v }))} /></Field>
                <div className="grid sm:grid-cols-3 gap-5">
                  <Field label="City *" error={errors.city}><Input value={address.currentCity} onChange={v => setAddress(a => ({ ...a, currentCity: v }))} error={!!errors.city} /></Field>
                  <Field label="State *" error={errors.state}><Select value={address.currentState} onChange={v => setAddress(a => ({ ...a, currentState: v }))} options={US_STATES} placeholder="Select" error={!!errors.state} /></Field>
                  <Field label="ZIP *" error={errors.zip}><Input value={address.currentZip} onChange={v => setAddress(a => ({ ...a, currentZip: v }))} maxLength={5} error={!!errors.zip} /></Field>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  <Field label="Residence Type"><Select value={address.residenceType} onChange={v => setAddress(a => ({ ...a, residenceType: v as ResidenceType }))} options={[{ value: 'own', label: 'Own' }, { value: 'rent', label: 'Rent' }, { value: 'other', label: 'Other' }]} /></Field>
                  <Field label="Monthly Payment ($)"><Input type="number" value={address.monthlyHousingPayment ? String(address.monthlyHousingPayment) : ''} onChange={v => setAddress(a => ({ ...a, monthlyHousingPayment: Number(v) }))} placeholder="1200" /></Field>
                  <Field label="Months at Address"><Input type="number" value={address.monthsAtCurrentAddress ? String(address.monthsAtCurrentAddress) : ''} onChange={v => setAddress(a => ({ ...a, monthsAtCurrentAddress: Number(v) }))} placeholder="24" /></Field>
                </div>
                {address.monthsAtCurrentAddress > 0 && address.monthsAtCurrentAddress < 24 && (
                  <div className="pt-6 border-t border-gray-200 space-y-5">
                    <h3 className="text-sm font-medium text-blue-600">Previous Address</h3>
                    <Field label="Street Address"><Input value={address.prevAddressLine1 || ''} onChange={v => setAddress(a => ({ ...a, prevAddressLine1: v }))} /></Field>
                    <div className="grid sm:grid-cols-3 gap-5">
                      <Field label="City"><Input value={address.prevAddressCity || ''} onChange={v => setAddress(a => ({ ...a, prevAddressCity: v }))} /></Field>
                      <Field label="State"><Select value={address.prevAddressState || ''} onChange={v => setAddress(a => ({ ...a, prevAddressState: v }))} options={US_STATES} placeholder="Select" /></Field>
                      <Field label="ZIP"><Input value={address.prevAddressZip || ''} onChange={v => setAddress(a => ({ ...a, prevAddressZip: v }))} maxLength={5} /></Field>
                    </div>
                    <Field label="Months at Previous Address"><Input type="number" value={address.monthsAtPrevAddress ? String(address.monthsAtPrevAddress) : ''} onChange={v => setAddress(a => ({ ...a, monthsAtPrevAddress: Number(v) }))} /></Field>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Employment & Income</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Employment Status"><Select value={employment.employmentStatus} onChange={v => setEmployment(e => ({ ...e, employmentStatus: v as EmploymentStatus }))} options={[{ value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' }, { value: 'self_employed', label: 'Self Employed' }, { value: 'retired', label: 'Retired' }, { value: 'other', label: 'Other' }]} /></Field>
                  <Field label="Income Type"><Select value={employment.incomeTypePrimary} onChange={v => setEmployment(e => ({ ...e, incomeTypePrimary: v as IncomeType }))} options={[{ value: 'employment', label: 'Employment' }, { value: 'self_employed', label: 'Self-Employment' }, { value: 'retirement', label: 'Retirement' }, { value: 'disability', label: 'Disability' }, { value: 'ssi', label: 'SSI' }, { value: 'other', label: 'Other' }]} /></Field>
                </div>
                {(employment.employmentStatus === 'full_time' || employment.employmentStatus === 'part_time') && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Employer Name"><Input value={employment.employerName || ''} onChange={v => setEmployment(e => ({ ...e, employerName: v }))} /></Field>
                      <Field label="Job Title"><Input value={employment.jobTitle || ''} onChange={v => setEmployment(e => ({ ...e, jobTitle: v }))} /></Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Employer Address"><Input value={employment.employerAddress || ''} onChange={v => setEmployment(e => ({ ...e, employerAddress: v }))} /></Field>
                      <Field label="Employer Phone"><Input type="tel" value={employment.employerPhone || ''} onChange={v => setEmployment(e => ({ ...e, employerPhone: v }))} /></Field>
                    </div>
                  </>
                )}
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Months at Employer"><Input type="number" value={employment.monthsAtEmployer ? String(employment.monthsAtEmployer) : ''} onChange={v => setEmployment(e => ({ ...e, monthsAtEmployer: Number(v) }))} /></Field>
                  <Field label="Gross Monthly Income *" error={errors.income}><Input type="number" value={employment.grossMonthlyIncome ? String(employment.grossMonthlyIncome) : ''} onChange={v => setEmployment(e => ({ ...e, grossMonthlyIncome: Number(v) }))} placeholder="5000" error={!!errors.income} /></Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Other Income Source"><Input value={employment.otherIncomeSource || ''} onChange={v => setEmployment(e => ({ ...e, otherIncomeSource: v }))} placeholder="e.g. Rental income" /></Field>
                  <Field label="Other Monthly Income ($)"><Input type="number" value={employment.otherIncomeMonthly ? String(employment.otherIncomeMonthly) : ''} onChange={v => setEmployment(e => ({ ...e, otherIncomeMonthly: Number(v) }))} /></Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Vehicle Information</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Application Type"><Select value={vehicle.applicationType} onChange={v => setVehicle(ve => ({ ...ve, applicationType: v as ApplicationType }))} options={[{ value: 'new_vehicle', label: 'New Vehicle' }, { value: 'used_vehicle', label: 'Used Vehicle' }, { value: 'refinance', label: 'Refinance' }, { value: 'private_party', label: 'Private Party' }]} /></Field>
                  <Field label="Condition"><Select value={vehicle.vehicleCondition} onChange={v => setVehicle(ve => ({ ...ve, vehicleCondition: v as VehicleCondition }))} options={[{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }, { value: 'certified_pre_owned', label: 'Certified Pre-Owned' }]} /></Field>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <Field label="Year"><Input type="number" value={String(vehicle.year)} onChange={v => setVehicle(ve => ({ ...ve, year: Number(v) }))} /></Field>
                  <Field label="Make *" error={errors.make}><Select value={vehicle.make} onChange={v => setVehicle(ve => ({ ...ve, make: v }))} options={POPULAR_MAKES.map(m => ({ value: m, label: m }))} placeholder="Select" error={!!errors.make} /></Field>
                  <Field label="Model *" error={errors.model}><Input value={vehicle.model} onChange={v => setVehicle(ve => ({ ...ve, model: v }))} placeholder="e.g. Camry" error={!!errors.model} /></Field>
                  <Field label="Trim"><Input value={vehicle.trim || ''} onChange={v => setVehicle(ve => ({ ...ve, trim: v }))} placeholder="e.g. LE" /></Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="VIN (optional)"><Input value={vehicle.vin || ''} onChange={v => setVehicle(ve => ({ ...ve, vin: v }))} placeholder="17-character VIN" maxLength={17} /></Field>
                  <Field label="Asking Price *" error={errors.price}><Input type="number" value={vehicle.askingPrice ? String(vehicle.askingPrice) : ''} onChange={v => setVehicle(ve => ({ ...ve, askingPrice: Number(v) }))} placeholder="30000" error={!!errors.price} /></Field>
                </div>
                {vehicle.vehicleCondition !== 'new' && <Field label="Mileage"><Input type="number" value={vehicle.mileage ? String(vehicle.mileage) : ''} onChange={v => setVehicle(ve => ({ ...ve, mileage: Number(v) }))} placeholder="45000" /></Field>}
                <Toggle checked={vehicle.isPrivateParty} onChange={v => setVehicle(ve => ({ ...ve, isPrivateParty: v }))} label="Private party sale" />
                {!vehicle.isPrivateParty && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Dealer Name"><Input value={vehicle.dealerName || ''} onChange={v => setVehicle(ve => ({ ...ve, dealerName: v }))} /></Field>
                    <Field label="Dealer ZIP"><Input value={vehicle.dealerZip || ''} onChange={v => setVehicle(ve => ({ ...ve, dealerZip: v }))} maxLength={5} /></Field>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Deal Structure</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Cash Down Payment ($)"><Input type="number" value={deal.cashDownPayment ? String(deal.cashDownPayment) : ''} onChange={v => setDeal(d => ({ ...d, cashDownPayment: Number(v) }))} placeholder="2000" /></Field>
                  <Field label="Desired Term"><Select value={String(deal.desiredTermMonths)} onChange={v => setDeal(d => ({ ...d, desiredTermMonths: Number(v) as 36 | 48 | 60 | 72 | 84 }))} options={TERM_OPTIONS.map(t => ({ value: String(t.value), label: t.label }))} /></Field>
                </div>
                <Field label="Max Monthly Payment ($)"><Input type="number" value={deal.maxMonthlyPayment ? String(deal.maxMonthlyPayment) : ''} onChange={v => setDeal(d => ({ ...d, maxMonthlyPayment: Number(v) }))} placeholder="Optional" /></Field>
                <Toggle checked={deal.hasTradeIn} onChange={v => setDeal(d => ({ ...d, hasTradeIn: v }))} label="I have a trade-in" />
                {deal.hasTradeIn && (
                  <div className="pt-5 space-y-5 border-t border-gray-200">
                    <div className="grid sm:grid-cols-3 gap-5">
                      <Field label="Trade-In Year"><Input type="number" value={deal.tradeInYear ? String(deal.tradeInYear) : ''} onChange={v => setDeal(d => ({ ...d, tradeInYear: Number(v) }))} /></Field>
                      <Field label="Trade-In Make"><Input value={deal.tradeInMake || ''} onChange={v => setDeal(d => ({ ...d, tradeInMake: v }))} /></Field>
                      <Field label="Trade-In Model"><Input value={deal.tradeInModel || ''} onChange={v => setDeal(d => ({ ...d, tradeInModel: v }))} /></Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Trade-In VIN"><Input value={deal.tradeInVin || ''} onChange={v => setDeal(d => ({ ...d, tradeInVin: v }))} maxLength={17} /></Field>
                      <Field label="Payoff Amount ($)"><Input type="number" value={deal.tradeInPayoffAmount ? String(deal.tradeInPayoffAmount) : ''} onChange={v => setDeal(d => ({ ...d, tradeInPayoffAmount: Number(v) }))} /></Field>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-4 pt-2">
                  <Toggle checked={deal.gapInsuranceInterest} onChange={v => setDeal(d => ({ ...d, gapInsuranceInterest: v }))} label="Interested in GAP insurance" />
                  <Toggle checked={deal.extendedWarrantyInterest} onChange={v => setDeal(d => ({ ...d, extendedWarrantyInterest: v }))} label="Interested in extended warranty" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Co-Borrower</h2>
                <Toggle checked={hasCoBorrower} onChange={v => setHasCoBorrower(v)} label="Add a co-borrower to strengthen your application" />
                {hasCoBorrower ? (
                  <div className="space-y-5 pt-4">
                    <p className="text-xs text-gray-500">Adding a co-borrower with good credit can improve your approval odds and rate.</p>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="First Name"><Input value={coPersonal.firstName} onChange={v => setCoPersonal(p => ({ ...p, firstName: v }))} /></Field>
                      <Field label="Last Name"><Input value={coPersonal.lastName} onChange={v => setCoPersonal(p => ({ ...p, lastName: v }))} /></Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="SSN"><Input value={coPersonal.ssn} onChange={v => setCoPersonal(p => ({ ...p, ssn: v }))} placeholder="###-##-####" maxLength={11} /></Field>
                      <Field label="Date of Birth"><Input type="date" value={coPersonal.dob} onChange={v => setCoPersonal(p => ({ ...p, dob: v }))} /></Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Email"><Input type="email" value={coPersonal.email} onChange={v => setCoPersonal(p => ({ ...p, email: v }))} /></Field>
                      <Field label="Phone"><Input type="tel" value={coPersonal.phone} onChange={v => setCoPersonal(p => ({ ...p, phone: v }))} /></Field>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-gray-500">No co-borrower selected. You can proceed without one.</div>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Consent & Authorization</h2>
                <div className="space-y-5">
                  <Checkbox
                    checked={consent.termsOfService}
                    onChange={v => setConsent(c => ({ ...c, termsOfService: v }))}
                    label={<>I agree to the <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</Link></>}
                  />
                  {errors.terms && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.softPullConsent}
                    onChange={v => setConsent(c => ({ ...c, softPullConsent: v }))}
                    label="I consent to Auto Loan Pro sharing my application with participating lenders for the purpose of obtaining pre-qualification offers."
                  />
                  {errors.soft && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.hardPullConsent}
                    onChange={v => setConsent(c => ({ ...c, hardPullConsent: v }))}
                    label="I authorize a soft credit inquiry that will NOT affect my credit score. I understand this allows Auto Loan Pro to check my credit for pre-qualification purposes."
                  />
                  {errors.creditCheck && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.tcpaConsent}
                    onChange={v => setConsent(c => ({ ...c, tcpaConsent: v }))}
                    label="I understand that selecting a lender offer may result in a hard credit inquiry by that lender, which may affect my credit score."
                  />
                  {errors.tcpa && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}

                  <Checkbox
                    checked={consent.eSignConsent}
                    onChange={v => setConsent(c => ({ ...c, eSignConsent: v }))}
                    label="I certify that the information I have provided in this application is true, accurate, and complete to the best of my knowledge."
                  />
                  {errors.esign && <p className="text-xs text-red-500 -mt-3 ml-8">Required</p>}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Equal Credit Opportunity Act Notice</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      The federal Equal Credit Opportunity Act prohibits creditors from discriminating against credit applicants on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has the capacity to enter into a binding contract), because all or part of the applicant&apos;s income derives from any public assistance program, or because the applicant has in good faith exercised any right under the Consumer Credit Protection Act. The federal agency that administers compliance with this law concerning this creditor is the Federal Trade Commission, Equal Credit Opportunity, Washington, DC 20580.
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed mt-3">
                      For more information about your rights under the ECOA, visit our <Link href="/disclosures/ecoa" target="_blank" className="text-blue-600 hover:text-blue-500 underline">ECOA Notice page</Link>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8 pb-12">
          {step > 0 ? (
            <button onClick={back} className="px-6 py-3 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl transition-colors duration-200 cursor-pointer">Back</button>
          ) : <div />}
          {step < 6 ? (
            <button onClick={next} className="px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors duration-200 cursor-pointer">Continue</button>
          ) : (
            <button onClick={submit} disabled={submitting} className="px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors duration-200 cursor-pointer">Submit Application</button>
          )}
        </div>
      </div>
    </div>
  );
}
