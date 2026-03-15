"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Building2, Clock, Plug } from 'lucide-react';
import { US_STATES } from '@/lib/us-states';

const monthlySalesOptions = ['1-10', '11-25', '26-50', '51-100', '100+'] as const;
const vehicleTypeOptions = ['New', 'Used', 'CPO'] as const;

type VehicleType = (typeof vehicleTypeOptions)[number];

type DealerFormData = {
  dealershipName: string;
  dealerLicenseNumber: string;
  contactName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  monthlyVehicleSalesVolume: string;
  vehicleTypes: VehicleType[];
  certifiedAccurate: boolean;
};

type ApiResponse = {
  success?: boolean;
  error?: string;
};

const initialFormData: DealerFormData = {
  dealershipName: '',
  dealerLicenseNumber: '',
  contactName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  monthlyVehicleSalesVolume: '1-10',
  vehicleTypes: [],
  certifiedAccurate: false,
};

const valueProps = [
  {
    title: 'Instant Pre-Approval',
    description: 'Customers get real offers in minutes, not days',
    icon: Clock,
  },
  {
    title: 'Multiple Lenders',
    description: 'More options means more approvals and better rates for your buyers',
    icon: Building2,
  },
  {
    title: 'Seamless Integration',
    description: 'Simple dashboard to track deals and communicate with lenders',
    icon: Plug,
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
  return 'w-full rounded-xl border border-[#D7E0EA] bg-white px-4 py-3 text-sm text-[#0A2540] shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100';
}

export default function DealerJoinPageClient() {
  const [formData, setFormData] = useState<DealerFormData>(initialFormData);
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

  const handleVehicleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = event.target;
    setErrorMessage(null);
    setFormData((current) => ({
      ...current,
      vehicleTypes: checked
        ? [...current.vehicleTypes, value as VehicleType]
        : current.vehicleTypes.filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.vehicleTypes.length === 0) {
      setErrorMessage('Select at least one vehicle type.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/dealers/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealershipName: formData.dealershipName,
          dealerLicenseNumber: formData.dealerLicenseNumber,
          primaryContactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          monthlyVehicleSalesVolume: formData.monthlyVehicleSalesVolume,
          vehicleTypes: formData.vehicleTypes,
          certifiedAccurate: formData.certifiedAccurate,
        }),
      });

      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || payload.success !== true) {
        setErrorMessage(payload.error || 'Unable to submit application.');
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage('Unable to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <section className="px-6 py-20 pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[32px] border border-[#E3E8EE] bg-[linear-gradient(180deg,#F9FBFF_0%,#FFFFFF_100%)] px-8 py-12 shadow-[0_24px_80px_rgba(10,37,64,0.08)] sm:px-12">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
                Dealer Network
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl">
                Give Your Customers More Options
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#425466]">
                Offer your buyers instant pre-approval from multiple lenders. Higher close rates, happier customers.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {valueProps.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-3xl border border-[#E3E8EE] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] ring-1 ring-blue-100">
                      <Icon className="h-5 w-5" />
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

      <section className="px-6 py-20">
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
            <div className="rounded-[28px] border border-[#E3E8EE] bg-white p-8 shadow-[0_24px_60px_rgba(10,37,64,0.08)] sm:p-10">
              <div className="mb-10">
                <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540]">Application Form</h2>
                <p className="mt-3 text-sm leading-6 text-[#425466]">
                  Share your dealership information and we will follow up with access details once our team completes review.
                </p>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="rounded-3xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Dealership details</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel required={true}>Dealership Name</FieldLabel>
                      <input required name="dealershipName" value={formData.dealershipName} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>Dealer License Number</FieldLabel>
                      <input required name="dealerLicenseNumber" value={formData.dealerLicenseNumber} onChange={handleChange} className={inputClassName()} />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E3E8EE] bg-white p-6">
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

                <div className="rounded-3xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Address</h3>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FieldLabel required={true}>Street</FieldLabel>
                      <input required name="street" value={formData.street} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>City</FieldLabel>
                      <input required name="city" value={formData.city} onChange={handleChange} className={inputClassName()} />
                    </div>
                    <div>
                      <FieldLabel required={true}>State</FieldLabel>
                      <select required name="state" value={formData.state} onChange={handleChange} className={inputClassName()}>
                        <option value="">Select state</option>
                        {US_STATES.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel required={true}>Zip</FieldLabel>
                      <input required inputMode="numeric" pattern="\d{5}" name="zip" value={formData.zip} onChange={handleChange} className={inputClassName()} />
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E3E8EE] bg-white p-6">
                  <h3 className="text-lg font-semibold text-[#0A2540]">Business profile</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <FieldLabel required={true}>Monthly Vehicle Sales Volume</FieldLabel>
                      <select name="monthlyVehicleSalesVolume" value={formData.monthlyVehicleSalesVolume} onChange={handleChange} className={inputClassName()}>
                        {monthlySalesOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel required={true}>Vehicle Types</FieldLabel>
                      <div className="grid gap-3 rounded-xl border border-[#D7E0EA] bg-white p-4">
                        {vehicleTypeOptions.map((option) => (
                          <label key={option} className="flex items-center gap-3 text-sm text-[#425466]">
                            <input
                              type="checkbox"
                              checked={formData.vehicleTypes.includes(option)}
                              onChange={handleVehicleTypeChange}
                              value={option}
                              className="h-4 w-4 rounded border-[#C8D4E3] text-blue-600 focus:ring-blue-500"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
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
                    className="mt-1 h-4 w-4 rounded border-[#C8D4E3] text-blue-600 focus:ring-blue-500"
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
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:mx-auto sm:w-auto sm:min-w-[220px]"
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
