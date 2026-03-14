/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { US_STATES } from '@/lib/constants';
import { apiPost } from '@/lib/hooks';
import Logo from '@/components/shared/Logo';

// ─── Types ──────────────────────────────────────────
type EmploymentStatus = 'employed' | 'self_employed' | 'retired' | 'student' | 'unemployed' | 'military';
type ResidenceType = 'own' | 'rent' | 'other';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  residenceType: ResidenceType;
  monthsAtAddress: number;
  employmentStatus: EmploymentStatus;
  employer: string;
  jobTitle: string;
  monthsEmployed: number;
  annualIncome: number;
  creditScoreRange: string;
  loanAmount: number;
}

const INITIAL_DATA: FormData = {
  firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', ssn: '',
  street: '', city: '', state: '', zip: '', residenceType: 'rent', monthsAtAddress: 24,
  employmentStatus: 'employed', employer: '', jobTitle: '', monthsEmployed: 24,
  annualIncome: 60000, creditScoreRange: '700-749', loanAmount: 25000,
};

// ─── Question definitions ───────────────────────────
interface Question {
  id: string;
  label: string;
  sublabel?: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'ssn' | 'select' | 'choice' | 'slider' | 'currency' | 'number' | 'consent';
  field: keyof FormData;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  validate?: (v: string | number, data: FormData) => string | null;
  skip?: (data: FormData) => boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'firstName',
    label: "What's your first name?",
    type: 'text',
    field: 'firstName',
    placeholder: 'First name',
    validate: (v) => (v as string).trim() ? null : 'Please enter your first name',
  },
  {
    id: 'lastName',
    label: "And your last name?",
    type: 'text',
    field: 'lastName',
    placeholder: 'Last name',
    validate: (v) => (v as string).trim() ? null : 'Please enter your last name',
  },
  {
    id: 'email',
    label: "What's your email?",
    sublabel: "We'll send your offers here",
    type: 'email',
    field: 'email',
    placeholder: 'you@example.com',
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v as string) ? null : 'Please enter a valid email',
  },
  {
    id: 'phone',
    label: "Phone number?",
    sublabel: "For account verification",
    type: 'tel',
    field: 'phone',
    placeholder: '(555) 555-5555',
    validate: (v) => (v as string).replace(/\D/g, '').length >= 10 ? null : 'Please enter a valid phone number',
  },
  {
    id: 'dateOfBirth',
    label: "Date of birth?",
    type: 'date',
    field: 'dateOfBirth',
    validate: (v) => (v as string) ? null : 'Please enter your date of birth',
  },
  {
    id: 'creditScoreRange',
    label: "What's your estimated credit score?",
    sublabel: "An estimate is fine — we verify later",
    type: 'choice',
    field: 'creditScoreRange',
    options: [
      { value: '750-850', label: 'Excellent (750+)' },
      { value: '700-749', label: 'Good (700-749)' },
      { value: '650-699', label: 'Fair (650-699)' },
      { value: '600-649', label: 'Below Average (600-649)' },
      { value: '300-599', label: 'Rebuilding (Under 600)' },
    ],
  },
  {
    id: 'loanAmount',
    label: "How much do you need?",
    sublabel: "You can always adjust later",
    type: 'slider',
    field: 'loanAmount',
    min: 5000,
    max: 100000,
    step: 1000,
    format: (v) => `$${v.toLocaleString()}`,
  },
  {
    id: 'annualIncome',
    label: "What's your annual income?",
    sublabel: "Before taxes — gross income",
    type: 'currency',
    field: 'annualIncome',
    placeholder: '$60,000',
    validate: (v) => (v as number) >= 15000 ? null : 'Minimum income is $15,000',
  },
  {
    id: 'employmentStatus',
    label: "Employment status?",
    type: 'choice',
    field: 'employmentStatus',
    options: [
      { value: 'employed', label: 'Employed' },
      { value: 'self_employed', label: 'Self-Employed' },
      { value: 'military', label: 'Military' },
      { value: 'retired', label: 'Retired' },
      { value: 'student', label: 'Student' },
      { value: 'unemployed', label: 'Unemployed' },
    ],
  },
  {
    id: 'employer',
    label: "Who do you work for?",
    type: 'text',
    field: 'employer',
    placeholder: 'Company name',
    validate: (v) => (v as string).trim() ? null : 'Please enter your employer',
    skip: (data) => !['employed', 'military'].includes(data.employmentStatus),
  },
  {
    id: 'jobTitle',
    label: "What's your job title?",
    type: 'text',
    field: 'jobTitle',
    placeholder: 'Job title',
    skip: (data) => !['employed', 'self_employed', 'military'].includes(data.employmentStatus),
  },
  {
    id: 'monthsEmployed',
    label: "How long have you been there?",
    type: 'choice',
    field: 'monthsEmployed',
    options: [
      { value: '6', label: 'Less than 6 months' },
      { value: '12', label: '6-12 months' },
      { value: '24', label: '1-2 years' },
      { value: '48', label: '2-4 years' },
      { value: '60', label: '4+ years' },
    ],
    skip: (data) => !['employed', 'self_employed', 'military'].includes(data.employmentStatus),
  },
  {
    id: 'street',
    label: "What's your address?",
    type: 'text',
    field: 'street',
    placeholder: '123 Main St',
    validate: (v) => (v as string).trim() ? null : 'Please enter your street address',
  },
  {
    id: 'city',
    label: "City?",
    type: 'text',
    field: 'city',
    placeholder: 'City',
    validate: (v) => (v as string).trim() ? null : 'Please enter your city',
  },
  {
    id: 'state',
    label: "State?",
    type: 'select',
    field: 'state',
    options: US_STATES,
    validate: (v) => (v as string) ? null : 'Please select your state',
  },
  {
    id: 'zip',
    label: "Zip code?",
    type: 'text',
    field: 'zip',
    placeholder: '12345',
    validate: (v) => /^\d{5}(-\d{4})?$/.test(v as string) ? null : 'Please enter a valid zip code',
  },
  {
    id: 'ssn',
    label: "Last step — your Social Security number",
    sublabel: "Encrypted with bank-level security. Used only for your credit check.",
    type: 'ssn',
    field: 'ssn',
    placeholder: 'XXX-XX-XXXX',
    validate: (v) => (v as string).replace(/\D/g, '').length === 9 ? null : 'Please enter a valid 9-digit SSN',
  },
  {
    id: 'consent',
    label: "Almost there",
    sublabel: "Review and authorize your application",
    type: 'consent',
    field: 'firstName', // dummy field, consent is handled separately
  },
];

// ─── Animation variants ─────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

// ─── Format helpers ─────────────────────────────────
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatSSN(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return `$${parseInt(digits).toLocaleString()}`;
}

// ─── Main Component ─────────────────────────────────
export default function ApplyV2Page() {
  const router = useRouter();
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState({ softPull: false, terms: false, esign: false });
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out skipped questions
  const activeQuestions = QUESTIONS.filter(q => !q.skip || !q.skip(data));
  const current = activeQuestions[currentIndex];
  const progress = ((currentIndex) / (activeQuestions.length - 1)) * 100;
  const isDevMode = typeof window !== 'undefined' && window.location.search.includes('dev=true');

  // Auto-focus input on question change
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const updateField = useCallback((field: keyof FormData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const validateCurrent = (): boolean => {
    if (!current) return false;
    if (current.type === 'consent') {
      if (!consent.softPull || !consent.terms || !consent.esign) {
        setError('Please agree to all required items');
        return false;
      }
      return true;
    }
    if (current.validate) {
      const err = current.validate(data[current.field], data);
      if (err) { setError(err); return false; }
    }
    return true;
  };

  const goNext = () => {
    if (!validateCurrent()) return;
    setError(null);
    if (currentIndex < activeQuestions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setError(null);
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && current?.type !== 'consent') {
      e.preventDefault();
      goNext();
    }
  };

  const handleSubmit = async () => {
    if (isDevMode) {
      setSubmitted(true);
      setTimeout(() => router.push('/results?dev=true'), 2000);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        personalInfo: {
          firstName: data.firstName, lastName: data.lastName, email: data.email,
          phone: data.phone, dateOfBirth: data.dateOfBirth, ssn: data.ssn.replace(/\D/g, ''),
        },
        addressInfo: {
          street: data.street, unit: '', city: data.city, state: data.state, zip: data.zip,
          residenceType: data.residenceType, monthsAtAddress: data.monthsAtAddress,
        },
        employmentInfo: {
          status: data.employmentStatus, employer: data.employer, jobTitle: data.jobTitle,
          monthsEmployed: data.monthsEmployed, annualIncome: data.annualIncome,
          incomeType: 'salary' as const, payFrequency: 'biweekly' as const,
        },
        vehicleInfo: null,
        dealStructure: {
          requestedAmount: data.loanAmount, downPayment: 0, tradeInValue: 0,
          preferredTerm: 60, maxMonthlyPayment: 0,
        },
        creditInfo: { creditScoreRange: data.creditScoreRange, bankruptcyHistory: false, openAutoLoans: 0 },
        consent: {
          softPullConsent: consent.softPull, hardPullConsent: true, tcpaConsent: true,
          termsOfService: consent.terms, privacyPolicy: consent.terms, eSignConsent: consent.esign,
        },
        applicationType: 'individual',
      };

      const { data: appData } = await apiPost<{ id: string; sessionToken?: string }>('/api/applications', payload);
      setSubmitted(true);
      toast.success('Application submitted!');
      if (appData?.sessionToken) {
        setTimeout(() => router.push(`/results?token=${appData.sessionToken}`), 2000);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success Screen ──────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">You're in!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Finding your best offers now...</p>
        </motion.div>
      </div>
    );
  }

  // ─── Render Inputs ────────────────────────────────
  const renderInput = () => {
    if (!current) return null;

    switch (current.type) {
      case 'text':
      case 'email':
      case 'date':
        return (
          <input
            ref={inputRef}
            type={current.type}
            value={data[current.field] as string}
            onChange={e => updateField(current.field, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={current.placeholder}
            className="w-full text-2xl sm:text-3xl font-light bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 outline-none pb-3 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
            autoComplete={current.id === 'email' ? 'email' : current.id === 'firstName' ? 'given-name' : current.id === 'lastName' ? 'family-name' : undefined}
          />
        );

      case 'tel':
        return (
          <input
            ref={inputRef}
            type="tel"
            value={formatPhone(data.phone)}
            onChange={e => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={handleKeyDown}
            placeholder={current.placeholder}
            className="w-full text-2xl sm:text-3xl font-light bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 outline-none pb-3 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
            autoComplete="tel"
          />
        );

      case 'ssn':
        return (
          <input
            ref={inputRef}
            type="password"
            value={formatSSN(data.ssn)}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
              updateField('ssn', raw);
            }}
            onKeyDown={handleKeyDown}
            placeholder={current.placeholder}
            className="w-full text-2xl sm:text-3xl font-light bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 outline-none pb-3 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 transition-colors tracking-widest"
            autoComplete="off"
          />
        );

      case 'currency':
        return (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={data.annualIncome ? formatCurrency(data.annualIncome.toString()) : ''}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, '');
              updateField('annualIncome', digits ? parseInt(digits) : 0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={current.placeholder}
            className="w-full text-2xl sm:text-3xl font-light bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 outline-none pb-3 text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
          />
        );

      case 'select':
        return (
          <select
            value={data[current.field] as string}
            onChange={e => { updateField(current.field, e.target.value); }}
            onKeyDown={handleKeyDown}
            className="w-full text-2xl sm:text-3xl font-light bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 outline-none pb-3 text-gray-900 dark:text-gray-100 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select...</option>
            {current.options?.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );

      case 'choice':
        return (
          <div className="grid gap-3 w-full">
            {current.options?.map(o => {
              const isSelected = String(data[current.field]) === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => {
                    updateField(current.field, current.field === 'monthsEmployed' ? parseInt(o.value) : o.value);
                    // Auto-advance on choice selection after short delay
                    setTimeout(() => {
                      setError(null);
                      setDirection(1);
                      setCurrentIndex(prev => Math.min(prev + 1, activeQuestions.length - 1));
                    }, 300);
                  }}
                  className={`w-full px-6 py-4 rounded-xl text-left text-lg font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        );

      case 'slider':
        return (
          <div className="w-full">
            <div className="text-5xl sm:text-6xl font-bold text-blue-600 mb-8 tabular-nums">
              {current.format ? current.format(data[current.field] as number) : data[current.field]}
            </div>
            <input
              type="range"
              min={current.min}
              max={current.max}
              step={current.step}
              value={data[current.field] as number}
              onChange={e => updateField(current.field, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-3 text-sm text-gray-400">
              <span>{current.format ? current.format(current.min!) : current.min}</span>
              <span>{current.format ? current.format(current.max!) : current.max}</span>
            </div>
          </div>
        );

      case 'consent':
        return (
          <div className="w-full space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-5">
              {[
                { key: 'softPull' as const, label: 'I authorize Auto Loan Pro to perform a soft credit inquiry to match me with lenders. This will not affect my credit score.' },
                { key: 'terms' as const, label: 'I have read and agree to the Terms of Service and Privacy Policy.' },
                { key: 'esign' as const, label: 'I certify that all information provided is accurate and complete, and I consent to electronic signatures and communications.' },
              ].map(item => (
                <label key={item.key} className="flex gap-4 cursor-pointer group">
                  <div className="pt-0.5">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        consent[item.key]
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                      }`}
                      onClick={() => setConsent(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    >
                      {consent[item.key] && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                    onClick={() => setConsent(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                  >
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Top bar */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <Logo size="sm" />
        {currentIndex > 0 && (
          <button
            onClick={goBack}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-32">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current?.id || 'done'}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Question label */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {current?.label}
              </h1>
              {current?.sublabel && (
                <p className="text-base text-gray-500 dark:text-gray-400 mb-8">
                  {current.sublabel}
                </p>
              )}
              {!current?.sublabel && <div className="mb-8" />}

              {/* Input */}
              {renderInput()}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-red-500 text-sm mt-3"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA — fixed */}
      {current?.type !== 'choice' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-4">
            <button
              onClick={goNext}
              disabled={submitting}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold rounded-xl text-lg transition-all duration-200 active:scale-[0.98]"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : currentIndex === activeQuestions.length - 1 ? (
                'Submit Application'
              ) : (
                'Continue'
              )}
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap hidden sm:block">
              or press Enter
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
