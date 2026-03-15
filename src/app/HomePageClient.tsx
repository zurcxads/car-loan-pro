"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/shared/Logo";
import {
  FileText,
  BarChart3,
  CheckCircle,
  Shield,
  Lock,
  Key,
  ArrowRight,
  Star,
  Quote,
} from "lucide-react";
import Footer from "@/components/shared/Footer";

const stats = [
  { value: "2 Min", label: "Avg. approval time" },
  { value: "50+", label: "Partner lenders" },
  { value: "$0", label: "Application cost" },
  { value: "4.9/5", label: "Customer rating" },
];

const steps = [
  {
    number: "01",
    title: "Apply Online",
    description: "Complete one simple application in about two minutes with no dealer markup and no hidden fees.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Compare Offers",
    description: "Review real pre-approval options side-by-side so rates, terms, and payments are easy to compare.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Shop with Confidence",
    description: "Take your pre-approval anywhere and negotiate like a cash buyer before you step onto the lot.",
    icon: CheckCircle,
  },
];

const testimonials = [
  {
    quote:
      "I had three real offers before the dealership even brought out a worksheet. That changed the whole conversation.",
    name: "Danielle R.",
    location: "Austin, TX",
  },
  {
    quote:
      "The side-by-side comparison made it obvious which lender was actually best. No guessing, no pressure.",
    name: "Marcus T.",
    location: "Charlotte, NC",
  },
  {
    quote:
      "I expected a long process. It took a couple of minutes and I walked in already pre-approved at a lower rate.",
    name: "Elena V.",
    location: "San Diego, CA",
  },
];

function HeroArtwork() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] rounded-[2rem] border border-[#E3E8EE] bg-white p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(219,234,254,0.85),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.2),_transparent_30%)]" />
      <svg
        viewBox="0 0 600 640"
        className="relative h-full min-h-[420px] w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="flow-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="35%" stopColor="#60A5FA" />
            <stop offset="70%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <linearGradient id="flow-b" x1="90%" y1="10%" x2="10%" y2="90%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="30%" stopColor="#93C5FD" />
            <stop offset="65%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <filter id="blur-xl">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        <path
          d="M70 145C126 44 250 12 350 58C430 95 516 164 511 260C507 342 399 342 360 407C320 472 379 598 292 610C189 624 42 544 37 425C33 319 19 236 70 145Z"
          fill="url(#flow-a)"
          opacity="0.95"
        />
        <path
          d="M535 150C570 239 530 363 436 392C356 417 298 359 223 378C137 400 59 512 21 430C-18 344 24 170 149 132C250 101 340 102 410 84C463 71 514 97 535 150Z"
          fill="url(#flow-b)"
          opacity="0.78"
        />
        <path
          d="M181 54C260 14 371 35 431 96C496 164 498 267 438 329C375 394 262 414 183 362C113 316 94 226 103 159C111 108 137 77 181 54Z"
          fill="url(#flow-a)"
          opacity="0.44"
          filter="url(#blur-xl)"
        />
        <path
          d="M147 261C182 214 233 220 280 196C329 171 371 116 426 138C488 163 543 246 525 311C507 376 430 389 370 401C305 414 248 453 188 427C123 399 74 357 85 307C92 276 126 289 147 261Z"
          fill="#FFFFFF"
          opacity="0.24"
        />
        <path
          d="M224 84C307 69 420 105 467 184C514 261 490 384 399 429C305 476 182 437 132 355C85 279 102 166 171 113C188 99 204 88 224 84Z"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.48"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="flex justify-center pt-6">
      <div className="relative h-[380px] w-[200px] rounded-[2rem] border border-[#E3E8EE] bg-white p-4">
        <div className="absolute left-1/2 top-3 h-4 w-24 -translate-x-1/2 rounded-full bg-[#E3E8EE]" />
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between text-sm font-medium text-[#6B7C93]">
            <span>Step 2 of 4</span>
            <span>50%</span>
          </div>
          <div className="mb-5 h-1.5 rounded-full bg-[#E3E8EE]">
            <div className="h-1.5 w-1/2 rounded-full bg-[#2563EB]" />
          </div>
          <div className="space-y-3">
            <div className="h-10 rounded-xl bg-[#F6F9FC]" />
            <div className="h-10 rounded-xl bg-[#F6F9FC]" />
            <div className="h-10 rounded-xl bg-[#F6F9FC]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 rounded-xl bg-[#F6F9FC]" />
              <div className="h-10 rounded-xl bg-[#F6F9FC]" />
            </div>
            <div className="h-20 rounded-2xl border border-[#E3E8EE] bg-white" />
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex h-11 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
            Continue
          </div>
        </div>
      </div>
    </div>
  );
}

function OffersMockup() {
  return (
    <div className="relative mt-8 h-[220px]">
      <div className="absolute left-2 top-14 h-[104px] w-[160px] rounded-2xl border border-[#E3E8EE] bg-white p-4 shadow-none">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F9FC] text-sm font-semibold text-[#0A2540]">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-[#0A2540]">Atlas Bank</p>
            <p className="text-sm text-[#6B7C93]">72 months</p>
          </div>
        </div>
        <p className="text-2xl font-semibold text-[#0A2540]">5.2%</p>
        <p className="text-sm text-[#425466]">$487/mo</p>
      </div>
      <div className="absolute left-16 top-7 h-[112px] w-[168px] rounded-2xl border border-[#E3E8EE] border-l-4 border-l-[#2563EB] bg-white p-4 shadow-none">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE] text-sm font-semibold text-[#2563EB]">
            C
          </div>
          <div>
            <p className="text-sm font-medium text-[#0A2540]">Crest Credit</p>
            <p className="text-sm text-[#6B7C93]">60 months</p>
          </div>
        </div>
        <p className="text-2xl font-semibold text-[#0A2540]">3.9%</p>
        <p className="text-sm text-[#425466]">$459/mo</p>
      </div>
      <div className="absolute left-28 top-20 h-[104px] w-[160px] rounded-2xl border border-[#E3E8EE] bg-white p-4 shadow-none">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F9FC] text-sm font-semibold text-[#0A2540]">
            N
          </div>
          <div>
            <p className="text-sm font-medium text-[#0A2540]">Northlane</p>
            <p className="text-sm text-[#6B7C93]">48 months</p>
          </div>
        </div>
        <p className="text-2xl font-semibold text-[#0A2540]">4.4%</p>
        <p className="text-sm text-[#425466]">$566/mo</p>
      </div>
    </div>
  );
}

function ApprovalMockup() {
  return (
    <div className="mt-8 flex justify-center">
      <div className="w-full max-w-[280px] rounded-[1.5rem] border border-[#BFDBFE] bg-[#EFF6FF] px-6 py-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7]">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-sm font-medium text-[#6B7C93]">Pre-Approved</p>
        <p className="mt-2 text-4xl font-semibold text-[#0A2540]">$5,000</p>
        <p className="mt-2 text-base font-medium text-[#2563EB]">3.9% APR</p>
        <div className="mt-6 rounded-full border border-[#BFDBFE] bg-white px-4 py-2 text-xs font-medium text-[#425466]">
          Soft pull only
        </div>
      </div>
    </div>
  );
}

function SecurityMockup() {
  return (
    <div className="relative mt-8 flex min-h-[220px] items-center justify-center">
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F6F9FC]" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-[#E3E8EE] bg-white">
        <Shield className="h-11 w-11 text-[#2563EB]" />
      </div>
      <div className="absolute left-12 top-12 flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E8EE] bg-white">
        <Lock className="h-4 w-4 text-[#6B7C93]" />
      </div>
      <div className="absolute right-14 top-16 flex h-10 w-10 items-center justify-center rounded-full border border-[#E3E8EE] bg-white">
        <Key className="h-4 w-4 text-[#6B7C93]" />
      </div>
      <div className="absolute bottom-8 left-14 space-y-2">
        <div className="h-2 w-24 rounded-full bg-[#E3E8EE]" />
        <div className="h-2 w-20 rounded-full bg-[#E3E8EE]" />
        <div className="h-2 w-28 rounded-full bg-[#E3E8EE]" />
      </div>
      <div className="absolute bottom-8 right-10 space-y-2">
        <div className="h-2 w-20 rounded-full bg-[#E3E8EE]" />
        <div className="h-2 w-24 rounded-full bg-[#E3E8EE]" />
        <div className="h-2 w-16 rounded-full bg-[#E3E8EE]" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [loanAmount, setLoanAmount] = useState(32000);
  const monthlyPayment = Math.round(loanAmount / 72);

  useEffect(() => {
    document.title = "Auto Loan Pro — Get Pre-Approved in Minutes";
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#425466]">
      <section className="min-h-[85vh] px-6 py-20 pt-28 md:py-24 md:pt-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-[#425466]">
                2-Minute Application | Real Offers from 50+ Lenders
              </p>
              <h1 className="text-5xl font-semibold leading-[1.15] text-[#0A2540] md:text-6xl">
                <span className="block">Pre-Approved in Minutes,</span>
                <span className="block text-[#6B7C93]">Not Weeks.</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#425466]">
                One application. Multiple lenders competing for you. No dealer markup, no hidden fees.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
              >
                Get Pre-Approved
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex w-full items-center justify-center rounded-full border border-[#2563EB] bg-white px-6 py-3 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#F6F9FC] sm:w-auto"
              >
                See How It Works
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <HeroArtwork />
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center lg:text-left">
              <p className="text-4xl font-semibold text-[#0A2540]">{stat.value}</p>
              <p className="mt-2 text-sm text-[#425466]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h2 className="max-w-[600px] text-4xl font-semibold leading-tight text-[#0A2540]">
              Everything you need to get the best auto loan.
            </h2>
            <p className="mt-4 text-xl text-[#425466]">
              Compare real offers from real lenders — no dealer markup.
            </p>
          </div>

          <div className="mt-14 space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="h-full rounded-xl border border-[#E3E8EE] bg-[linear-gradient(180deg,#FCFDFE_0%,#F7FAFF_100%)] p-8 transition-shadow hover:shadow-md lg:col-span-7">
                <h3 className="text-2xl font-semibold text-[#0A2540]">Apply in 2 Minutes</h3>
                <p className="mt-3 max-w-lg text-[#425466]">
                  A short digital application replaces dealership paperwork, repeat credit checks, and back-office delays.
                </p>
                <PhoneMockup />
              </div>
              <div className="h-full rounded-xl border border-[#E3E8EE] bg-[linear-gradient(180deg,#FCFDFE_0%,#F8FBFF_100%)] p-8 transition-shadow hover:shadow-md lg:col-span-5">
                <h3 className="text-2xl font-semibold text-[#0A2540]">Compare Real Offers</h3>
                <p className="mt-3 max-w-sm text-[#425466]">
                  See rates, terms, and monthly payments at a glance so the best offer is obvious.
                </p>
                <OffersMockup />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="h-full rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6 transition-shadow hover:shadow-md">
                <h3 className="text-2xl font-semibold text-[#0A2540]">Smart Pre-Approval</h3>
                <p className="mt-3 text-[#425466]">
                  Know your buying power early so you can shop with financing already lined up.
                </p>
                <ApprovalMockup />
              </div>

              <div className="h-full rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6 transition-shadow hover:shadow-md">
                <h3 className="text-2xl font-semibold text-[#0A2540]">Rate Calculator</h3>
                <p className="mt-3 text-[#425466]">
                  Adjust the amount and preview how small changes affect your estimated monthly payment.
                </p>
                <div className="mt-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B7C93]">Loan amount</span>
                    <span className="font-semibold text-[#0A2540]">${loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="relative mt-5 h-2 rounded-full bg-[#E3E8EE]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-[#2563EB]"
                      style={{ width: `${((loanAmount - 10000) / 40000) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={10000}
                      max={50000}
                      step={1000}
                      value={loanAmount}
                      onChange={(event) => setLoanAmount(Number(event.target.value))}
                      className="absolute -top-2 h-6 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#2563EB]"
                      aria-label="Loan amount"
                    />
                  </div>
                  <div className="mt-10 rounded-3xl bg-[#F6F9FC] p-6">
                    <p className="text-sm text-[#6B7C93]">Estimated payment</p>
                    <p className="mt-2 text-4xl font-semibold text-[#0A2540]">${monthlyPayment}/mo</p>
                    <p className="mt-2 text-sm text-[#425466]">72-month example based on your selected amount.</p>
                  </div>
                </div>
              </div>

              <div className="h-full rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6 transition-shadow hover:shadow-md">
                <h3 className="text-2xl font-semibold text-[#0A2540]">Bank-Level Security</h3>
                <p className="mt-3 text-[#425466]">
                  Sensitive data stays protected with encrypted transfer, secure storage, and controlled access.
                </p>
                <SecurityMockup />
              </div>
            </div>

            <div className="rounded-xl border border-[#E3E8EE] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)] p-8 transition-shadow hover:shadow-md">
              <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_auto_0.9fr]">
                <div>
                  <h3 className="text-2xl font-semibold text-[#0A2540]">Shop Anywhere with Your Pre-Approval</h3>
                  <p className="mt-3 max-w-xl text-[#425466]">
                    Secure financing first, then take your approval with you to any dealership and focus on the car instead of the finance office.
                  </p>
                  <div className="mt-8 max-w-md rounded-[1.5rem] border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                    <div className="flex items-center justify-between">
                      <Logo size="sm" />
                      <span className="rounded-full border border-[#E3E8EE] bg-white px-3 py-1.5 text-xs font-medium text-[#425466]">
                        Pre-Approval
                      </span>
                    </div>
                    <div className="mt-8">
                      <p className="text-sm text-[#6B7C93]">Approved amount</p>
                      <p className="mt-1 text-4xl font-semibold text-[#0A2540]">$38,500</p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#6B7C93]">Rate</p>
                        <p className="mt-1 font-semibold text-[#0A2540]">4.1% APR</p>
                      </div>
                      <div>
                        <p className="text-[#6B7C93]">Valid through</p>
                        <p className="mt-1 font-semibold text-[#0A2540]">May 30, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E3E8EE] bg-white">
                    <ArrowRight className="h-6 w-6 text-[#2563EB]" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-2xl bg-[#F6F9FC] p-5">
                    <p className="text-sm font-medium text-[#0A2540]">Walk in already funded</p>
                    <p className="mt-2 text-sm text-[#425466]">
                      Use your pre-approval as leverage and keep the negotiation focused on price.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F6F9FC] p-5">
                    <p className="text-sm font-medium text-[#0A2540]">Buy from any seller</p>
                    <p className="mt-2 text-sm text-[#425466]">
                      Shop across dealers and inventory without reapplying every time you change vehicles.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F6F9FC] p-5">
                    <p className="text-sm font-medium text-[#0A2540]">Avoid finance office pressure</p>
                    <p className="mt-2 text-sm text-[#425466]">
                      You already know your rate, terms, and budget before stepping onto the lot.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold text-[#0A2540]">How it works</h2>
            <p className="mt-4 text-lg text-[#425466]">
              Three clear steps from application to dealership-ready financing.
            </p>
          </div>

          <div className="relative mt-14 grid gap-10 lg:grid-cols-3">
            <div className="absolute left-[16.66%] right-[16.66%] top-10 hidden border-t border-[#E3E8EE] lg:block" />
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative h-full rounded-xl border border-[#E3E8EE] bg-white p-8 transition-shadow hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540] text-sm font-semibold text-white">
                    {step.number}
                  </div>
                  <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F9FC]">
                    <Icon className="h-7 w-7 text-[#2563EB]" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-[#0A2540]">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#425466]">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="max-w-lg text-4xl font-semibold text-[#0A2540]">What customers&nbsp;say</h2>
            <p className="mt-4 text-lg text-[#425466]">
              Real buyers using pre-approval to shop on their terms.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="h-full rounded-xl border border-[#E3E8EE] border-t-2 border-t-blue-600 p-8"
              >
                <div className="flex items-center justify-between">
                  <Quote className="h-8 w-8 text-[#2563EB]" />
                  <div className="flex items-center gap-1 text-[#2563EB]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="mt-6 text-lg leading-8 text-[#425466]">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-8">
                  <p className="font-semibold text-[#0A2540]">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-[#6B7C93]">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[linear-gradient(135deg,#2563EB_0%,#1D4ED8_55%,#0F766E_100%)] px-6 py-20 text-center md:py-24">
          <h2 className="text-4xl font-semibold text-white">Ready to get pre-approved?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Takes just 2 minutes. No impact on your credit score.
          </p>
          <div className="mt-8">
            <Link
              href="/apply"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-blue-50 sm:w-auto"
            >
              Start Your Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
