/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useRef, useId } from 'react';
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  Lock,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import { US_STATES, POPULAR_MAKES } from '@/lib/constants';
import { apiPost } from '@/lib/api-client';
import { showDevTools } from '@/lib/env';
import type {
  BorrowerPersonalInfo, AddressInfo, EmploymentInfo, VehicleInfo,
  DealStructure, ConsentInfo, ApplicationType, VehicleCondition,
  ResidenceType, EmploymentStatus, IncomeType,
} from '@/lib/types';

const STEP_NAMES = ['About You', 'Income & Employment', 'Credit Consent', 'Review & Submit'];
const CREDIT_RANGE_OPTIONS = [
  { value: 'fair', label: 'Fair (580-669)' },
  { value: 'good', label: 'Good (670-739)' },
  { value: 'very_good', label: 'Very Good (740-799)' },
  { value: 'excellent', label: 'Excellent (800+)' },
];

type ApplyPrefill = {
  name: string;
  creditRange: string;
  loanAmount: number | null;
};

type StepIndex = 0 | 1 | 2 | 3;

type ReviewSection = {
  title: string;
  stepIndex: StepIndex;
  rows: { label: string; value: string; missing?: boolean }[];
  issues: string[];
};

function normalizeCreditRangeParam(value: string): string {
  const normalizedValue = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return CREDIT_RANGE_OPTIONS.some((option) => option.value === normalizedValue) ? normalizedValue : '';
}

function parseLoanAmountParam(value: string): number | null {
  const loanAmount = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(loanAmount) && loanAmount > 0 ? loanAmount : null;
}

function getApplyPrefill(searchParams: ReadonlyURLSearchParams): ApplyPrefill | null {
  const name = searchParams.get('name')?.trim() || '';
  const creditRange = normalizeCreditRangeParam(searchParams.get('creditRange') || '');
  const loanAmount = parseLoanAmountParam(searchParams.get('loanAmount') || '');

  if (!name && !creditRange && loanAmount === null) {
    return null;
  }

  return { name, creditRange, loanAmount };
}

function formatCurrencyDisplay(value: number): string {
  return value > 0 ? value.toLocaleString('en-US') : '';
}

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function Label({
  htmlFor,
  children,
  helper,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  helper?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-[#0A2540]">
        {children}
      </label>
      {helper}
    </div>
  );
}

function Field({
  error,
  count,
  maxLength,
  children,
}: {
  error?: string;
  count?: number;
  maxLength?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {children}
      <div className="flex min-h-[20px] items-start justify-between gap-2">
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500"
            aria-live="assertive"
          >
            {error}
          </motion.p>
        ) : (
          <span />
        )}
        {typeof maxLength === 'number' && typeof count === 'number' && (
          <span className="text-xs text-[#6B7C93]">
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  maxLength,
  isValid,
  autoComplete,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  maxLength?: number;
  isValid?: boolean;
  autoComplete?: string;
  helper?: React.ReactNode;
}) {
  const inputId = useId();

  return (
    <Field error={error} count={value.length} maxLength={maxLength}>
      <Label htmlFor={inputId} helper={helper}>{label}</Label>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={`min-h-[52px] w-full rounded-xl border bg-white px-4 py-3.5 pr-12 text-base text-[#0A2540] placeholder:text-[#6B7C93] transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-[#E3E8EE]'}`}
        />
        {isValid && value && !error && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <Check className="h-5 w-5 text-emerald-500" />
          </div>
        )}
      </div>
    </Field>
  );
}

function CurrencyInput({
  label,
  value,
  onChange,
  error,
  isValid,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
  isValid?: boolean;
  placeholder?: string;
}) {
  const inputId = useId();
  const displayValue = formatCurrencyDisplay(value);

  return (
    <Field error={error}>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base text-[#6B7C93]">
          $
        </div>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={(event) => onChange(parseCurrencyInput(event.target.value))}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`min-h-[52px] w-full rounded-xl border bg-white py-3.5 pl-8 pr-12 text-base text-[#0A2540] placeholder:text-[#6B7C93] transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error ? 'border-red-400' : 'border-[#E3E8EE]'}`}
        />
        {isValid && value > 0 && !error && (
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <Check className="h-5 w-5 text-emerald-500" />
          </div>
        )}
      </div>
    </Field>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  isValid,
  autoFocusNext,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  isValid?: boolean;
  autoFocusNext?: boolean;
}) {
  const selectId = useId();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);

    if (autoFocusNext && event.target.value) {
      window.setTimeout(() => {
        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>('input, select, textarea, button')
        ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
        const currentIndex = focusables.indexOf(event.target);
        const nextFocusable = focusables[currentIndex + 1];
        if (nextFocusable) {
          nextFocusable.focus();
          nextFocusable.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 120);
    }
  };

  return (
    <Field error={error}>
      <Label htmlFor={selectId}>{label}</Label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={handleChange}
          aria-invalid={!!error}
          className={`min-h-[52px] w-full appearance-none rounded-xl border bg-white px-4 py-3.5 pr-12 text-base transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${value ? 'text-[#0A2540]' : 'text-[#6B7C93]'} ${error ? 'border-red-400' : 'border-[#E3E8EE]'}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-2">
          {isValid && value && !error && <Check className="h-5 w-5 text-emerald-500" />}
          <ChevronDown className="h-5 w-5 text-[#6B7C93]" />
        </div>
      </div>
    </Field>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string | React.ReactNode;
}) {
  const checkboxId = useId();

  return (
    <label
      htmlFor={checkboxId}
      className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border border-[#E3E8EE] bg-white p-4 transition-colors hover:border-blue-300"
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 rounded border-[#C4CDD5] text-blue-600 focus:ring-2 focus:ring-blue-500/20"
      />
      <span className="text-sm leading-6 text-[#425466]">{label}</span>
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  const labelId = useId();

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E3E8EE] bg-white p-4">
      <span id={labelId} className="text-sm font-medium text-[#0A2540]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${checked ? 'bg-blue-600' : 'bg-[#C4CDD5]'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl bg-[#F6F9FC] p-6">
      <h3 className="text-sm font-semibold text-[#0A2540]">{title}</h3>
      {children}
    </section>
  );
}

export default function ApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAppliedSearchPrefill = useRef(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isDevMode, setIsDevMode] = useState(showDevTools());
  const [timeEstimate, setTimeEstimate] = useState(2);

  useEffect(() => {
    document.title = 'Apply for Pre-Approval — Auto Loan Pro';
  }, []);

  useEffect(() => {
    setIsDevMode(showDevTools());
  }, []);

  useEffect(() => {
    const estimates = [2, 1.5, 1, 0.5];
    setTimeEstimate(estimates[step] || 0.5);
  }, [step]);

  const [personal, setPersonal] = useState<BorrowerPersonalInfo>({ firstName: '', lastName: '', ssn: '', dob: '', email: '', phone: '', preferredLanguage: 'english' });
  const [address, setAddress] = useState<AddressInfo>({ currentAddressLine1: '', currentCity: '', currentState: '', currentZip: '', residenceType: 'rent', monthlyHousingPayment: 0, monthsAtCurrentAddress: 0 });
  const [employment, setEmployment] = useState<EmploymentInfo>({ employmentStatus: 'full_time' as EmploymentStatus, monthsAtEmployer: 0, grossMonthlyIncome: 0, incomeTypePrimary: 'employment' as IncomeType });
  const [vehicle, setVehicle] = useState<VehicleInfo>({ applicationType: 'used_vehicle' as ApplicationType, vehicleCondition: 'used' as VehicleCondition, year: new Date().getFullYear(), make: '', model: '', askingPrice: 0, isPrivateParty: false });
  const [deal, setDeal] = useState<DealStructure>({ cashDownPayment: 0, hasTradeIn: false, desiredTermMonths: 60, gapInsuranceInterest: false, extendedWarrantyInterest: false });
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [coPersonal, setCoPersonal] = useState<BorrowerPersonalInfo>({ firstName: '', lastName: '', ssn: '', dob: '', email: '', phone: '' });
  const [consent, setConsent] = useState<ConsentInfo>({ softPullConsent: false, hardPullConsent: false, tcpaConsent: false, termsOfService: false, privacyPolicy: false, eSignConsent: false });
  const [hasVehicle, setHasVehicle] = useState(false);
  const [estimatedCreditRange, setEstimatedCreditRange] = useState('');
  const targetVehiclePrice = vehicle.askingPrice ?? 0;
  const progress = ((step + 1) / STEP_NAMES.length) * 100;

  useEffect(() => {
    if (hasAppliedSearchPrefill.current) return;

    const prefill = getApplyPrefill(searchParams);
    if (!prefill) {
      return;
    }

    if (prefill.name) {
      const [firstName = '', ...lastNameParts] = prefill.name.split(/\s+/);
      setPersonal((current) => ({
        ...current,
        firstName: current.firstName || firstName,
        lastName: current.lastName || lastNameParts.join(' '),
      }));
    }

    if (prefill.creditRange) {
      setEstimatedCreditRange(prefill.creditRange);
    }

    if (prefill.loanAmount !== null) {
      const loanAmount = prefill.loanAmount;
      setHasVehicle(true);
      setVehicle((current) => ({
        ...current,
        askingPrice: current.askingPrice || loanAmount,
      }));
    }

    hasAppliedSearchPrefill.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (isDevMode && step === 0 && !personal.firstName && !hasAppliedSearchPrefill.current) {
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

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
  };

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

  const getStepErrors = (targetStep: StepIndex): Record<string, string> => {
    if (isDevMode) {
      return {};
    }

    const nextErrors: Record<string, string> = {};

    if (targetStep === 0) {
      if (!personal.firstName.trim()) nextErrors.firstName = 'Please enter your first name';
      if (!personal.lastName.trim()) nextErrors.lastName = 'Please enter your last name';
      if (!personal.ssn || personal.ssn.replace(/\D/g, '').length !== 9) nextErrors.ssn = 'Please enter a valid 9-digit SSN';
      if (!personal.dob) nextErrors.dob = 'Please enter your date of birth';
      else {
        const age = Math.floor((new Date().getTime() - new Date(personal.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) nextErrors.dob = 'You must be at least 18 years old';
      }
      if (!personal.email.includes('@')) nextErrors.email = 'Please enter a valid email address';
      if (!personal.phone || personal.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Please enter a 10-digit phone number';
      if (!address.currentAddressLine1.trim()) nextErrors.address1 = 'Please enter your street address';
      if (!address.currentCity.trim()) nextErrors.city = 'Please enter your city';
      if (!address.currentState) nextErrors.state = 'Please select your state';
      if (!address.currentZip || address.currentZip.length < 5) nextErrors.zip = 'Please enter a valid 5-digit ZIP code';
    } else if (targetStep === 1) {
      if (!employment.grossMonthlyIncome || employment.grossMonthlyIncome <= 0) nextErrors.income = 'Please enter your monthly income';
      else if (employment.grossMonthlyIncome < 1000) nextErrors.income = 'Minimum monthly income is $1,000';
    } else if (targetStep === 2) {
      if (!consent.softPullConsent) nextErrors.soft = 'You must consent to a soft credit pull to proceed';
      if (!consent.hardPullConsent) nextErrors.creditCheck = 'You must acknowledge the hard credit inquiry';
      if (!consent.tcpaConsent) nextErrors.tcpa = 'You must consent to receive communications';
      if (!consent.termsOfService) nextErrors.terms = 'You must agree to the Terms of Service';
      if (!consent.privacyPolicy) nextErrors.privacy = 'You must agree to the Privacy Policy';
      if (!consent.eSignConsent) nextErrors.esign = 'You must certify that the information is accurate';
    } else if (targetStep === 3) {
      if (hasVehicle) {
        if (!vehicle.make) nextErrors.make = 'Please select the vehicle make';
        if (!vehicle.model?.trim()) nextErrors.model = 'Please enter the vehicle model';
        if (!vehicle.askingPrice || vehicle.askingPrice <= 0) nextErrors.price = 'Please enter the vehicle price';
      }
    }

    return nextErrors;
  };

  const validate = (): boolean => {
    const nextErrors = getStepErrors(step);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToStep = (nextStep: StepIndex) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const next = () => {
    if (isDevMode || validate()) {
      goToStep(Math.min(step + 1, 3) as StepIndex);
    }
  };

  const back = () => {
    goToStep(Math.max(step - 1, 0) as StepIndex);
  };

  const submitApplication = async () => {
    if (isDevMode) {
      setSubmitting(true);
      router.push('/results');
      return;
    }

    if (!validate()) return;
    setSubmitting(true);

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
      const appData = data as { id: string };
      localStorage.setItem('clp_current_app_id', appData.id);

      toast.success('Application submitted! Finding your best rates...');
      setTimeout(() => router.push('/results'), 2500);
    }
  };

  const reviewSections: ReviewSection[] = [
    {
      title: 'Personal information',
      stepIndex: 0,
      rows: [
        { label: 'Full name', value: `${personal.firstName} ${personal.lastName}`.trim(), missing: !personal.firstName.trim() || !personal.lastName.trim() },
        { label: 'SSN', value: personal.ssn ? `***-**-${personal.ssn.replace(/\D/g, '').slice(-4)}` : '', missing: !validateSSN(personal.ssn) },
        { label: 'Date of birth', value: personal.dob, missing: !personal.dob },
        { label: 'Email', value: personal.email, missing: !personal.email.includes('@') },
        { label: 'Phone', value: personal.phone, missing: personal.phone.replace(/\D/g, '').length !== 10 },
      ],
      issues: Object.values(getStepErrors(0)).filter((message, index, list) => list.indexOf(message) === index),
    },
    {
      title: 'Address',
      stepIndex: 0,
      rows: [
        { label: 'Street', value: address.currentAddressLine1, missing: !address.currentAddressLine1.trim() },
        { label: 'City', value: address.currentCity, missing: !address.currentCity.trim() },
        { label: 'State', value: address.currentState, missing: !address.currentState },
        { label: 'ZIP', value: address.currentZip, missing: address.currentZip.length !== 5 },
        { label: 'Residence', value: address.residenceType.replace('_', ' '), missing: false },
        { label: 'Housing payment', value: address.monthlyHousingPayment ? `$${address.monthlyHousingPayment.toLocaleString()}` : 'Not provided', missing: false },
      ],
      issues: [getStepErrors(0).address1, getStepErrors(0).city, getStepErrors(0).state, getStepErrors(0).zip].filter(Boolean) as string[],
    },
    {
      title: 'Income & employment',
      stepIndex: 1,
      rows: [
        { label: 'Employment status', value: employment.employmentStatus.replace(/_/g, ' '), missing: false },
        { label: 'Gross monthly income', value: employment.grossMonthlyIncome ? `$${employment.grossMonthlyIncome.toLocaleString()}` : '', missing: !employment.grossMonthlyIncome || employment.grossMonthlyIncome <= 0 },
        { label: 'Employer', value: employment.employerName || 'Not provided', missing: false },
        { label: 'Months at employer', value: employment.monthsAtEmployer ? String(employment.monthsAtEmployer) : 'Not provided', missing: false },
      ],
      issues: Object.values(getStepErrors(1)),
    },
    {
      title: 'Credit consent',
      stepIndex: 2,
      rows: [
        { label: 'Soft pull consent', value: consent.softPullConsent ? 'Accepted' : 'Missing', missing: !consent.softPullConsent },
        { label: 'Lender hard inquiry notice', value: consent.hardPullConsent ? 'Accepted' : 'Missing', missing: !consent.hardPullConsent },
        { label: 'Communications consent', value: consent.tcpaConsent ? 'Accepted' : 'Missing', missing: !consent.tcpaConsent },
        { label: 'Terms, privacy, e-sign', value: consent.termsOfService && consent.privacyPolicy && consent.eSignConsent ? 'Accepted' : 'Missing items', missing: !(consent.termsOfService && consent.privacyPolicy && consent.eSignConsent) },
      ],
      issues: Object.values(getStepErrors(2)),
    },
  ];

  if (hasVehicle || estimatedCreditRange || targetVehiclePrice) {
    reviewSections.push({
      title: 'Vehicle & loan preferences',
      stepIndex: 3,
      rows: [
        { label: 'Estimated credit range', value: CREDIT_RANGE_OPTIONS.find((option) => option.value === estimatedCreditRange)?.label || 'Not provided', missing: false },
        { label: 'Vehicle year', value: hasVehicle ? String(vehicle.year || '') : 'Not provided', missing: false },
        { label: 'Make', value: hasVehicle ? vehicle.make || '' : 'Not provided', missing: hasVehicle && !vehicle.make },
        { label: 'Model', value: hasVehicle ? vehicle.model || '' : 'Not provided', missing: hasVehicle && !vehicle.model?.trim() },
        { label: 'Target price', value: targetVehiclePrice > 0 ? `$${targetVehiclePrice.toLocaleString()}` : 'Not provided', missing: hasVehicle && targetVehiclePrice <= 0 },
      ],
      issues: Object.values(getStepErrors(3)),
    });
  }

  if (submitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white" aria-live="polite">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F6F9FC]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#0A2540]">Analyzing your application...</h2>
            <p className="text-sm text-[#6B7C93]">Matching you with lenders in our network.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16 sm:px-6">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="hidden text-sm font-medium text-[#6B7C93] sm:block">Step {step + 1} of 4</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#0A2540]">{STEP_NAMES[step]}</h1>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              {isDevMode && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Auto-filled
                </span>
              )}
              <span className="text-sm text-[#6B7C93]">~{timeEstimate} min left</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#E3E8EE]">
              <motion.div
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="h-full rounded-full bg-blue-600"
              />
            </div>
            <div className="flex items-center justify-between sm:hidden">
              <span className="text-sm font-medium text-[#0A2540]">{STEP_NAMES[step]}</span>
              {isDevMode && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                  Auto-filled
                </span>
              )}
            </div>
          </div>
          <div className="sr-only" aria-live="polite">
            {`Application step ${step + 1} of 4: ${STEP_NAMES[step]}`}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#E3E8EE] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[#E3E8EE] px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[#0A2540]">Auto Loan Pro application</p>
                <p className="text-sm text-[#6B7C93]">Complete your application in a few secure steps.</p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-[#425466]">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                256-bit encrypted
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <SectionCard title="Personal details">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput
                          label="First name *"
                          value={personal.firstName}
                          onChange={(v) => setPersonal((p) => ({ ...p, firstName: v }))}
                          error={errors.firstName}
                          isValid={personal.firstName.trim().length > 0}
                          autoComplete="given-name"
                        />
                        <TextInput
                          label="Last name *"
                          value={personal.lastName}
                          onChange={(v) => setPersonal((p) => ({ ...p, lastName: v }))}
                          error={errors.lastName}
                          isValid={personal.lastName.trim().length > 0}
                          autoComplete="family-name"
                        />
                        <TextInput
                          label="Social Security Number *"
                          value={personal.ssn}
                          onChange={(v) => setPersonal((p) => ({ ...p, ssn: formatSSN(v) }))}
                          placeholder="123-45-6789"
                          error={errors.ssn}
                          maxLength={11}
                          isValid={validateSSN(personal.ssn)}
                          autoComplete="off"
                          helper={
                            <span className="inline-flex items-center gap-1 text-xs text-[#6B7C93]">
                              <Lock className="h-3.5 w-3.5" />
                              256-bit encrypted
                            </span>
                          }
                        />
                        <TextInput
                          label="Date of birth *"
                          type="date"
                          value={personal.dob}
                          onChange={(v) => setPersonal((p) => ({ ...p, dob: v }))}
                          error={errors.dob}
                          isValid={!!personal.dob}
                          autoComplete="bday"
                        />
                        <TextInput
                          label="Email address *"
                          type="email"
                          value={personal.email}
                          onChange={(v) => setPersonal((p) => ({ ...p, email: v }))}
                          error={errors.email}
                          isValid={personal.email.includes('@')}
                          autoComplete="email"
                        />
                        <TextInput
                          label="Phone number *"
                          type="tel"
                          value={personal.phone}
                          onChange={(v) => setPersonal((p) => ({ ...p, phone: formatPhone(v) }))}
                          placeholder="(555) 555-1234"
                          error={errors.phone}
                          maxLength={14}
                          isValid={personal.phone.replace(/\D/g, '').length === 10}
                          autoComplete="tel"
                        />
                      </div>
                    </SectionCard>

                    <SectionCard title="Address">
                      <div className="space-y-4">
                        <TextInput
                          label="Street address *"
                          value={address.currentAddressLine1}
                          onChange={(v) => setAddress((a) => ({ ...a, currentAddressLine1: v }))}
                          error={errors.address1}
                          isValid={address.currentAddressLine1.trim().length > 0}
                          autoComplete="address-line1"
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <TextInput
                            label="City *"
                            value={address.currentCity}
                            onChange={(v) => setAddress((a) => ({ ...a, currentCity: v }))}
                            error={errors.city}
                            isValid={address.currentCity.trim().length > 0}
                            autoComplete="address-level2"
                          />
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <Select
                              label="State *"
                              value={address.currentState}
                              onChange={(v) => setAddress((a) => ({ ...a, currentState: v }))}
                              options={US_STATES}
                              placeholder="Select"
                              error={errors.state}
                              isValid={!!address.currentState}
                              autoFocusNext={true}
                            />
                            <TextInput
                              label="ZIP *"
                              value={address.currentZip}
                              onChange={(v) => setAddress((a) => ({ ...a, currentZip: formatZIP(v) }))}
                              error={errors.zip}
                              maxLength={5}
                              isValid={address.currentZip.length === 5}
                              autoComplete="postal-code"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <Select
                            label="Residence type"
                            value={address.residenceType}
                            onChange={(v) => setAddress((a) => ({ ...a, residenceType: v as ResidenceType }))}
                            options={[{ value: 'own', label: 'Own' }, { value: 'rent', label: 'Rent' }, { value: 'other', label: 'Other' }]}
                            isValid={!!address.residenceType}
                          />
                          <CurrencyInput
                            label="Monthly payment"
                            value={address.monthlyHousingPayment}
                            onChange={(v) => setAddress((a) => ({ ...a, monthlyHousingPayment: v }))}
                            placeholder="1,200"
                            isValid={address.monthlyHousingPayment > 0}
                          />
                          <TextInput
                            label="Months at address"
                            value={address.monthsAtCurrentAddress ? String(address.monthsAtCurrentAddress) : ''}
                            onChange={(v) => setAddress((a) => ({ ...a, monthsAtCurrentAddress: Number(v.replace(/[^\d]/g, '')) }))}
                            placeholder="24"
                            type="text"
                            isValid={address.monthsAtCurrentAddress > 0}
                          />
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard title="Loan preferences">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                          label="Estimated credit range"
                          value={estimatedCreditRange}
                          onChange={setEstimatedCreditRange}
                          options={CREDIT_RANGE_OPTIONS}
                          placeholder="Select a range"
                          isValid={!!estimatedCreditRange}
                        />
                        <CurrencyInput
                          label="Target vehicle price"
                          value={vehicle.askingPrice ?? 0}
                          onChange={(v) => {
                            setHasVehicle(v > 0);
                            setVehicle((ve) => ({ ...ve, askingPrice: v }));
                          }}
                          placeholder="25,000"
                          isValid={(vehicle.askingPrice ?? 0) > 0}
                        />
                      </div>
                    </SectionCard>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <SectionCard title="Income & employment">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Select
                          label="Employment status"
                          value={employment.employmentStatus}
                          onChange={(v) => setEmployment((e) => ({ ...e, employmentStatus: v as EmploymentStatus }))}
                          options={[
                            { value: 'full_time', label: 'Full Time' },
                            { value: 'part_time', label: 'Part Time' },
                            { value: 'self_employed', label: 'Self Employed' },
                            { value: 'retired', label: 'Retired' },
                            { value: 'other', label: 'Other' },
                          ]}
                          isValid={!!employment.employmentStatus}
                          autoFocusNext={true}
                        />
                        <CurrencyInput
                          label="Gross monthly income *"
                          value={employment.grossMonthlyIncome}
                          onChange={(v) => setEmployment((e) => ({ ...e, grossMonthlyIncome: v }))}
                          error={errors.income}
                          isValid={employment.grossMonthlyIncome > 0}
                          placeholder="5,000"
                        />
                      </div>

                      {(employment.employmentStatus === 'full_time' || employment.employmentStatus === 'part_time') && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextInput
                              label="Employer name"
                              value={employment.employerName || ''}
                              onChange={(v) => setEmployment((e) => ({ ...e, employerName: v }))}
                              isValid={!!employment.employerName}
                              maxLength={80}
                            />
                            <TextInput
                              label="Months at current employer"
                              value={employment.monthsAtEmployer ? String(employment.monthsAtEmployer) : ''}
                              onChange={(v) => setEmployment((e) => ({ ...e, monthsAtEmployer: Number(v.replace(/[^\d]/g, '')) }))}
                              placeholder="24"
                              type="text"
                              isValid={employment.monthsAtEmployer > 0}
                            />
                          </div>

                          <AnimatePresence>
                            {employment.monthsAtEmployer > 0 && employment.monthsAtEmployer < 24 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-4 rounded-xl border border-[#E3E8EE] bg-white p-4">
                                  <p className="text-sm font-medium text-[#0A2540]">Previous employer</p>
                                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <TextInput
                                      label="Previous employer name"
                                      value={employment.prevEmployerName || ''}
                                      onChange={(v) => setEmployment((e) => ({ ...e, prevEmployerName: v }))}
                                      maxLength={80}
                                    />
                                    <TextInput
                                      label="Months at previous employer"
                                      value={employment.prevMonthsAtEmployer ? String(employment.prevMonthsAtEmployer) : ''}
                                      onChange={(v) => setEmployment((e) => ({ ...e, prevMonthsAtEmployer: Number(v.replace(/[^\d]/g, '')) }))}
                                      placeholder="18"
                                      type="text"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </SectionCard>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <SectionCard title="Credit authorization">
                      <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                        <CreditCard className="h-4 w-4" />
                        Soft pull only - won't affect your credit
                      </div>

                      <div className="space-y-3">
                        <Checkbox
                          checked={consent.softPullConsent}
                          onChange={(v) => setConsent((c) => ({ ...c, softPullConsent: v }))}
                          label="I consent to a soft credit inquiry to check my credit for pre-qualification."
                        />
                        {errors.soft && <p className="-mt-1 text-sm text-red-500">{errors.soft}</p>}

                        <Checkbox
                          checked={consent.hardPullConsent}
                          onChange={(v) => setConsent((c) => ({ ...c, hardPullConsent: v }))}
                          label="I understand that selecting a lender may result in a hard credit inquiry by that lender."
                        />
                        {errors.creditCheck && <p className="-mt-1 text-sm text-red-500">{errors.creditCheck}</p>}

                        <Checkbox
                          checked={consent.tcpaConsent}
                          onChange={(v) => setConsent((c) => ({ ...c, tcpaConsent: v }))}
                          label="I consent to receive communications via phone, email, or SMS regarding my application."
                        />
                        {errors.tcpa && <p className="-mt-1 text-sm text-red-500">{errors.tcpa}</p>}

                        <Checkbox
                          checked={consent.termsOfService}
                          onChange={(v) => setConsent((c) => ({ ...c, termsOfService: v }))}
                          label={<>I agree to the <Link href="/terms" target="_blank" onClick={(event) => event.stopPropagation()} className="text-blue-600 underline hover:text-blue-500">Terms of Service</Link>.</>}
                        />
                        {errors.terms && <p className="-mt-1 text-sm text-red-500">{errors.terms}</p>}

                        <Checkbox
                          checked={consent.privacyPolicy}
                          onChange={(v) => setConsent((c) => ({ ...c, privacyPolicy: v }))}
                          label={<>I agree to the <Link href="/privacy" target="_blank" onClick={(event) => event.stopPropagation()} className="text-blue-600 underline hover:text-blue-500">Privacy Policy</Link>.</>}
                        />
                        {errors.privacy && <p className="-mt-1 text-sm text-red-500">{errors.privacy}</p>}

                        <Checkbox
                          checked={consent.eSignConsent}
                          onChange={(v) => setConsent((c) => ({ ...c, eSignConsent: v }))}
                          label="I certify that the information I provided is true and accurate."
                        />
                        {errors.esign && <p className="-mt-1 text-sm text-red-500">{errors.esign}</p>}
                      </div>
                    </SectionCard>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <SectionCard title="Review your application">
                      <div className="space-y-4">
                        {reviewSections.map((section) => (
                          <div
                            key={section.title}
                            className={`rounded-xl border p-5 ${section.issues.length > 0 ? 'border-amber-300 bg-amber-50/60' : 'border-[#E3E8EE] bg-white'}`}
                          >
                            <div className="mb-4 flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-[#0A2540]">{section.title}</h4>
                                {section.issues.length > 0 ? (
                                  <p className="mt-1 text-sm text-amber-700">Review this section before submitting.</p>
                                ) : (
                                  <p className="mt-1 text-sm text-[#6B7C93]">Looks complete.</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => goToStep(section.stepIndex)}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#E3E8EE] px-4 py-2 text-sm font-medium text-[#0A2540] transition-all hover:bg-[#F6F9FC]"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {section.rows.map((row) => (
                                <div key={`${section.title}-${row.label}`} className="rounded-lg bg-[#F6F9FC] px-4 py-3">
                                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#6B7C93]">{row.label}</p>
                                  <p className={`mt-1 text-sm ${row.missing ? 'text-amber-700' : 'text-[#0A2540]'}`}>
                                    {row.value || 'Missing'}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {section.issues.length > 0 && (
                              <div className="mt-4 rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm text-amber-800">
                                {section.issues.join(' ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCard>

                    <SectionCard title="Optional additions">
                      <div className="space-y-4">
                        <Toggle checked={hasCoBorrower} onChange={setHasCoBorrower} label="Add a co-borrower" />

                        <AnimatePresence>
                          {hasCoBorrower && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#E3E8EE] bg-white p-4 sm:grid-cols-2">
                                <TextInput label="First name" value={coPersonal.firstName} onChange={(v) => setCoPersonal((p) => ({ ...p, firstName: v }))} />
                                <TextInput label="Last name" value={coPersonal.lastName} onChange={(v) => setCoPersonal((p) => ({ ...p, lastName: v }))} />
                                <TextInput
                                  label="SSN"
                                  value={coPersonal.ssn}
                                  onChange={(v) => setCoPersonal((p) => ({ ...p, ssn: formatSSN(v) }))}
                                  placeholder="123-45-6789"
                                  maxLength={11}
                                  helper={
                                    <span className="inline-flex items-center gap-1 text-xs text-[#6B7C93]">
                                      <Lock className="h-3.5 w-3.5" />
                                      Encrypted
                                    </span>
                                  }
                                />
                                <TextInput label="Date of birth" type="date" value={coPersonal.dob} onChange={(v) => setCoPersonal((p) => ({ ...p, dob: v }))} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Toggle checked={hasVehicle} onChange={setHasVehicle} label="I have a specific vehicle in mind" />

                        <AnimatePresence>
                          {hasVehicle && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#E3E8EE] bg-white p-4 sm:grid-cols-2">
                                <TextInput
                                  label="Year"
                                  value={String(vehicle.year || new Date().getFullYear())}
                                  onChange={(v) => setVehicle((ve) => ({ ...ve, year: Number(v.replace(/[^\d]/g, '')) }))}
                                  type="text"
                                />
                                <Select
                                  label="Make *"
                                  value={vehicle.make || ''}
                                  onChange={(v) => setVehicle((ve) => ({ ...ve, make: v }))}
                                  options={POPULAR_MAKES.map((make) => ({ value: make, label: make }))}
                                  placeholder="Select make"
                                  error={errors.make}
                                  isValid={!!vehicle.make}
                                  autoFocusNext={true}
                                />
                                <TextInput
                                  label="Model *"
                                  value={vehicle.model || ''}
                                  onChange={(v) => setVehicle((ve) => ({ ...ve, model: v }))}
                                  error={errors.model}
                                  maxLength={40}
                                  isValid={!!vehicle.model}
                                />
                                <CurrencyInput
                                  label="Price *"
                                  value={vehicle.askingPrice ?? 0}
                                  onChange={(v) => setVehicle((ve) => ({ ...ve, askingPrice: v }))}
                                  error={errors.price}
                                  isValid={(vehicle.askingPrice ?? 0) > 0}
                                  placeholder="30,000"
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </SectionCard>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-[#E3E8EE] px-6 py-4 sm:px-8">
            <div className="flex items-center gap-2 text-sm text-[#6B7C93]">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Bank-grade encryption and secure lender routing
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#E3E8EE] bg-white px-6 py-3 sm:hidden">
        <div className={`mx-auto grid max-w-2xl gap-3 ${step > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="min-h-[52px] w-full rounded-full border border-[#E3E8EE] bg-white px-8 py-3.5 text-base font-medium text-[#0A2540] transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step === 3 ? (
            <button
              type="button"
              onClick={submitApplication}
              disabled={submitting}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Submit Application
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="min-h-[52px] w-full rounded-full bg-blue-600 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-blue-500"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-6 pb-10">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="min-h-[52px] rounded-full border border-[#E3E8EE] bg-white px-8 py-3.5 text-base font-medium text-[#0A2540] transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step === 3 ? (
            <button
              type="button"
              onClick={submitApplication}
              disabled={submitting}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Submit Application
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="min-h-[52px] rounded-full bg-blue-600 px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-blue-500"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
