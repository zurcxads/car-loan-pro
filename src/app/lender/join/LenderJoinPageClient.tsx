"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { LayoutDashboard, Shield, Users } from 'lucide-react';
import { useToast } from '@/components/shared/ToastProvider';

const ficoOptions = ['500', '550', '600', '620', '640', '660', '680', '700', '720'] as const;
const termOptions = ['24', '36', '48', '60', '72', '84'] as const;

type LenderFormData = {
  companyName: string;
  nmlsNumber: string;
  contactName: string;
  email: string;
  phone: string;
  minFicoScore: string;
  maxLtv: string;
  rateMin: string;
  rateMax: string;
  statesServed: string;
  minLoanAmount: string;
  maxLoanAmount: string;
  maxTermMonths: string;
  certifiedAccurate: boolean;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
};

const initialFormData: LenderFormData = {
  companyName: '',
  nmlsNumber: '',
  contactName: '',
  email: '',
  phone: '',
  minFicoScore: '620',
  maxLtv: '',
  rateMin: '',
  rateMax: '',
  statesServed: '',
  minLoanAmount: '',
  maxLoanAmount: '',
  maxTermMonths: '60',
  certifiedAccurate: false,
};

const valueProps = [
  {
    title: 'Pre-Qualified Leads',
    description: 'Every applicant has consented to a credit check and provided verified information',
    icon: Users,
  },
  {
    title: 'Dashboard Access',
    description: 'Review applications, request documents, and manage decisions from your portal',
    icon: LayoutDashboard,
  },
  {
    title: 'No Risk',
    description: 'Pay only when a deal funds. No subscription fees, no commitments',
    icon: Shield,
  },
];

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-[#0A2540]">
      {children}
      {required ? <span className="ml-1 text-[#2563EB]">*</span> : null}
    </label>
  );
}

function inputClassName() {
  return 'premium-input w-full rounded-xl border border-[#D7E0EA] bg-white px-4 py-3 text-sm text-[#0A2540] shadow-sm';
}

export default function LenderJoinPageClient() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<LenderFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, type } = event.target;
    const value = type === 'checkbox' && event.target instanceof HTMLInputElement
      ? event.target.checked
      : event.target.value;

    setErrorMessage(null);
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/lenders/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          nmlsNumber: formData.nmlsNumber,
          primaryContactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          minFicoScore: formData.minFicoScore,
          maxLtv: Number(formData.maxLtv),
          rateMin: Number(formData.rateMin),
          rateMax: Number(formData.rateMax),
          statesServed: formData.statesServed,
          minLoanAmount: Number(formData.minLoanAmount),
          maxLoanAmount: Number(formData.maxLoanAmount),
          maxTermMonths: Number(formData.maxTermMonths),
          certifiedAccurate: formData.certifiedAccurate,
        }),
      });

      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || payload.success !== true) {
        const errorMessage = payload.error || 'Unable to submit application.';
        setErrorMessage(errorMessage);
        toast({ type: 'error', message: errorMessage });
        return;
      }

      setIsSuccess(true);
      toast({ type: 'success', message: 'Lender application submitted successfully.' });
    } catch {
      const errorMessage = 'Unable to submit application.';
      setErrorMessage(errorMessage);
      toast({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="premium-page bg-white">
      <section className="animate-fade-in-up px-6 py-20 pt-32 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-[#E3E8EE] bg-[linear-gradient(180deg,#F9FBFF_0%,#FFFFFF_100%)] px-8 py-12 shadow-[0_24px_80px_rgba(10,37,64,0.08)] sm:px-12">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
                Lender Network
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl">
                Partner with Auto Loan Pro
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#425466]">
                Access qualified auto loan applicants. No upfront cost. Pay per funded deal.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {valueProps.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="premium-card rounded-3xl border border-[#E3E8EE] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <div className="inline-flex rounded-xl bg-blue-50 p-3">
                      <Icon className="h-10 w-10 text-[#2563EB]" />
                    </div>
                    <h2 className="mt-5 text-lg font-semibold text-[#0A2540]">{item.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#425466]">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          {isSuccess ? (
            <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(180deg,#EFF6FF_0%,#FFFFFF_100%)] p-10 shadow-[0_24px_60px_rgba(37,99,235,0.12)]">
              <span className="inline-flex rounded-full bg-blue-600 px-4 py-1 text-sm font-semibold text-white">
                Application Submitted
              </span>
              <p className="mt-5 text-lg leading-8 text-[#425466]">
                Our team will review your application and contact you within 2 business days.
              </p>
            </div>
          ) : (
            <div className="premium-card rounded-[28px] border border-[#E3E8EE] bg-white p-8 shadow-[0_24px_60px_rgba(10,37,64,0.08)] sm:p-10">
              <div className="mb-10">
                <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540]">Application Form</h2>
                <p className="mt-3 text-sm leading-6 text-[#425466]">
                  Tell us about your institution and your lending criteria. We will review your submission and follow up with next steps.
                </p>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="premium-card rounded-3xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Company details</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel required={true}>Company Name</FieldLabel>
                      <input required name="companyName" value={formData.companyName} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>NMLS Number</FieldLabel>
                      <input required name="nmlsNumber" value={formData.nmlsNumber} onChange={handleChange} className={inputClassName()} />
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-3xl border border-[#E3E8EE] bg-white p-6">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Primary contact</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel required={true}>Contact Name</FieldLabel>
                      <input required name="contactName" value={formData.contactName} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>Email</FieldLabel>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>Phone</FieldLabel>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClassName()} />
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-3xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Lending Criteria</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel required={true}>Min FICO Score</FieldLabel>
                      <select name="minFicoScore" value={formData.minFicoScore} onChange={handleChange} className={inputClassName()}>
                        {ficoOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel required={true}>Max LTV %</FieldLabel>
                      <input required type="number" min="0" step="0.01" name="maxLtv" value={formData.maxLtv} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel required={true}>Rate Range Min-Max</FieldLabel>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input required type="number" min="0" step="0.01" name="rateMin" value={formData.rateMin} onChange={handleChange} className={inputClassName()} placeholder="Minimum rate" />
                        <input required type="number" min="0" step="0.01" name="rateMax" value={formData.rateMax} onChange={handleChange} className={inputClassName()} placeholder="Maximum rate" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel required={true}>States Served</FieldLabel>
                      <textarea required name="statesServed" value={formData.statesServed} onChange={handleChange} rows={4} className={inputClassName()} placeholder="CA, TX, FL" />
                    </div>
                  </div>
                </div>

                <div className="premium-card rounded-3xl border border-[#E3E8EE] bg-white p-6">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Loan Parameters</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel required={true}>Min Loan Amount</FieldLabel>
                      <input required type="number" min="0" step="1" name="minLoanAmount" value={formData.minLoanAmount} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>Max Loan Amount</FieldLabel>
                      <input required type="number" min="0" step="1" name="maxLoanAmount" value={formData.maxLoanAmount} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>Max Term in months</FieldLabel>
                      <select name="maxTermMonths" value={formData.maxTermMonths} onChange={handleChange} className={inputClassName()}>
                        {termOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-[#E3E8EE] bg-[#F6F9FC] p-4 text-sm text-[#425466]">
                  <input
                    required
                    type="checkbox"
                    name="certifiedAccurate"
                    checked={formData.certifiedAccurate}
                    onChange={handleChange}
                    className="premium-input mt-1 h-4 w-4 rounded border-[#C8D4E3] text-blue-600 accent-blue-600"
                  />
                  <span>I certify that the information provided is accurate and complete</span>
                </label>

                {errorMessage ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="premium-button inline-flex min-h-12 w-full items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:mx-auto sm:w-auto sm:min-w-[220px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Apply to Join'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
