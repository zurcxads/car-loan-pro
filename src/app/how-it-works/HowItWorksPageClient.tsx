"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Footer from "@/components/shared/Footer";

const processSteps = [
  {
    number: "01",
    title: "Complete one secure application",
    summary:
      "Share your financing goals, basic household details, and the car you have in mind in one streamlined flow.",
    detailTitle: "What happens in this step",
    details: [
      "Enter core borrower details once instead of repeating them at every bank or dealership.",
      "Review estimated budget, down payment, and term preferences before you submit.",
      "Save time by starting before you shop, so financing is not negotiated on the lot.",
    ],
    note: "Most borrowers finish in about two minutes.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Compare lender offers side by side",
    summary:
      "We match your profile with lenders so you can evaluate rate, term, and payment tradeoffs in one place.",
    detailTitle: "How comparison works",
    details: [
      "A single soft inquiry helps surface lender matches without adding multiple hard pulls upfront.",
      "Offers are organized so monthly payment, APR, and total cost are easy to compare.",
      "You stay in control of the decision instead of negotiating around dealer markup.",
    ],
    note: "Transparency is built into the comparison view.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Shop with a clear financing plan",
    summary:
      "Choose the offer that fits your budget, then head to the dealership with terms already defined.",
    detailTitle: "What you leave with",
    details: [
      "Bring a pre-approval into the buying process and focus the conversation on the vehicle price.",
      "Use your approved amount and payment target as a practical shopping guardrail.",
      "Move forward with the lender you choose when you are ready to finalize the purchase.",
    ],
    note: "You arrive with financing context, not pressure.",
    icon: CheckCircle2,
  },
];

const highlights = [
  {
    title: "One application",
    description: "Start once and avoid re-entering the same information across multiple lenders.",
    icon: FileText,
  },
  {
    title: "Clear comparisons",
    description: "See the important terms in a format that makes rate and payment tradeoffs obvious.",
    icon: CircleDollarSign,
  },
  {
    title: "Soft pull first",
    description: "Initial matching is designed to protect shopping flexibility while you compare options.",
    icon: ShieldCheck,
  },
];

export default function HowItWorksPage() {
  const [expandedStep, setExpandedStep] = useState<number>(0);

  useEffect(() => {
    document.title = "How It Works — Auto Loan Pro";
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#425466]">
      <section className="px-6 pb-20 pt-28 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-2 text-sm font-medium text-[#0A2540]">
              Financing in three clear steps
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl">
              See exactly how Auto Loan Pro moves you from application to pre-approval.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[#425466] sm:text-lg">
              The process is designed to feel structured, fast, and readable. You submit once, compare
              lender options in one place, and shop with financing already mapped out.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/apply"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Get pre-approved
              </Link>
              <Link
                href="/calculator"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Estimate your payment
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#E3E8EE] bg-[#F6F9FC] p-8">
            <div className="grid gap-4">
              {highlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <div
                    key={highlight.title}
                    className="rounded-xl border border-[#E3E8EE] bg-white p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F9FC] text-[#2563EB]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[#0A2540]">{highlight.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#425466]">
                          {highlight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
              A guided process, not a black box
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#425466] sm:text-lg">
              Each step is designed to reduce friction and make financing choices easier to understand.
            </p>
          </div>

          <div className="mt-16 space-y-6">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              const isExpanded = expandedStep === index;

              return (
                <div key={step.number} className="relative">
                  {index < processSteps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-8 top-20 hidden h-[calc(100%+1.5rem)] w-px bg-[#D7DFE8] md:block"
                    />
                  )}

                  <div className="rounded-xl border border-[#E3E8EE] bg-white p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                      <div className="flex items-center gap-4 md:w-64 md:flex-col md:items-start md:gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6F9FC] text-[#2563EB]">
                          <Icon className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2563EB]">Step {step.number}</p>
                          <h3 className="mt-2 text-2xl font-semibold text-[#0A2540]">{step.title}</h3>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-base leading-relaxed text-[#425466]">{step.summary}</p>
                        <button
                          type="button"
                          onClick={() => setExpandedStep(isExpanded ? -1 : index)}
                          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E3E8EE] bg-white px-5 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          aria-expanded={isExpanded}
                          aria-controls={`how-it-works-step-${step.number}`}
                        >
                          {isExpanded ? "Hide details" : "Expand details"}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isExpanded && (
                          <div
                            id={`how-it-works-step-${step.number}`}
                            className="mt-6 rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6"
                          >
                            <h4 className="text-lg font-semibold text-[#0A2540]">{step.detailTitle}</h4>
                            <ul className="mt-4 space-y-3">
                              {step.details.map((detail) => (
                                <li key={detail} className="flex items-start gap-3 text-sm leading-relaxed text-[#425466]">
                                  <ArrowRight className="mt-0.5 h-4 w-4 flex-none text-[#2563EB]" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                            <p className="mt-5 text-sm font-medium text-[#6B7C93]">{step.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#E3E8EE] bg-white p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
                Why the process works better before you visit a dealer
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                <p className="text-3xl font-semibold text-[#0A2540]">2 min</p>
                <p className="mt-2 text-sm leading-relaxed text-[#425466]">Average time to complete the application flow.</p>
              </div>
              <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                <p className="text-3xl font-semibold text-[#0A2540]">1 view</p>
                <p className="mt-2 text-sm leading-relaxed text-[#425466]">One place to compare the financing details that matter.</p>
              </div>
              <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                <p className="text-3xl font-semibold text-[#0A2540]">0 markup</p>
                <p className="mt-2 text-sm leading-relaxed text-[#425466]">A process designed to keep dealer-added financing noise out of the way.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
            Ready to see your financing options?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#425466] sm:text-lg">
            Start with one application and review real offers in a cleaner, faster flow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Get pre-approved
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
