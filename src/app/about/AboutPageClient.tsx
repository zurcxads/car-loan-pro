"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Eye, Scale, ShieldCheck, Users } from "lucide-react";
import Footer from "@/components/shared/Footer";

const values = [
  {
    title: "Clarity over pressure",
    description:
      "We design the experience so borrowers can compare rate, term, and payment without dealership-style friction.",
    icon: Eye,
  },
  {
    title: "Consumer-first incentives",
    description:
      "The product is built to help people shop with better information before they reach the finance office.",
    icon: Scale,
  },
  {
    title: "Trust through structure",
    description:
      "Security, compliance, and readable disclosures matter because financing decisions carry real consequences.",
    icon: ShieldCheck,
  },
];

const metrics = [
  { label: "Application flow", value: "2 min", description: "A fast starting point for borrowers who want to shop prepared." },
  { label: "Lender network", value: "50+", description: "A broad network designed to improve comparison quality." },
  { label: "Consumer cost", value: "$0", description: "Borrowers can explore options without paying to start." },
  { label: "Trust signal", value: "Soft pull", description: "Initial matching is structured to protect shopping flexibility." },
];

const operatingPrinciples = [
  "Auto Loan Pro is a marketplace that connects borrowers with participating lenders.",
  "We are focused on replacing dealership financing opacity with cleaner comparisons.",
  "We believe a financing experience should feel editorial, direct, and easier to verify.",
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About — Auto Loan Pro";
  }, []);

  return (
    <div className="premium-page min-h-screen bg-white text-[#425466]">
      <section className="animate-fade-in-up px-6 pb-10 pt-24 md:pb-14 md:pt-32">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-2 text-sm font-medium text-[#0A2540]">
              About Auto Loan Pro
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl">
              We built Auto Loan Pro to make auto financing more legible for consumers.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[#425466] sm:text-lg">
              Buying a car often forces borrowers to untangle rates, terms, and dealer incentives at the same
              moment they are trying to negotiate the vehicle itself. We think that part of the process should
              be calmer, clearer, and easier to compare before anyone steps onto a lot.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#E3E8EE] bg-[#F6F9FC] p-8">
            <div className="space-y-6">
              <div className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F9FC] text-[#2563EB]">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2563EB]">Mission</p>
                    <h2 className="mt-1 text-lg font-semibold text-[#0A2540]">
                      Replace financing guesswork with structured comparison.
                    </h2>
                  </div>
                </div>
              </div>
              <div className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F9FC] text-[#2563EB]">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2563EB]">Vision</p>
                    <h2 className="mt-1 text-lg font-semibold text-[#0A2540]">
                      Give every borrower a financing plan before the dealership conversation starts.
                    </h2>
                  </div>
                </div>
              </div>
              <div className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F9FC] text-[#2563EB]">
                    <BadgeCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2563EB]">Positioning</p>
                    <h2 className="mt-1 text-lg font-semibold text-[#0A2540]">
                      A marketplace experience built around trust, speed, and disclosure.
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-8">
              <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
                Our point of view
              </h2>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-[#425466]">
                <p>
                  Traditional auto financing compresses too many high-stakes decisions into one setting. A borrower
                  may be comparing loan terms, negotiating vehicle price, and evaluating dealer add-ons in the same
                  hour. That structure favors speed and opacity over confidence.
                </p>
                <p>
                  Auto Loan Pro is designed to shift that sequence. We want financing to be reviewed earlier, in a
                  setting that makes offers easier to read and tradeoffs easier to understand. A pre-approval should
                  create leverage, not confusion.
                </p>
                <p>
                  The product direction is simple: remove avoidable friction, surface the terms that matter, and
                  keep the borrower oriented from the first step through lender selection.
                </p>
              </div>
            </div>

            <div className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-[#0A2540]">How we operate</h2>
              <ul className="mt-6 space-y-4">
                {operatingPrinciples.map((principle) => (
                  <li key={principle} className="flex items-start gap-3 text-sm leading-relaxed text-[#425466]">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-none text-[#2563EB]" />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-6">
                <p className="text-lg font-semibold text-[#0A2540]">Editorial by design</p>
                <p className="mt-2 text-sm leading-relaxed text-[#425466]">
                  We use straightforward language, measured visuals, and explicit disclosures because borrowers should
                  not need to decode the interface while making a financing decision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
              Values that shape the product
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#425466] sm:text-lg">
              Every consumer-facing decision should reinforce clarity, trust, and control.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div key={value.title} className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F9FC] text-[#2563EB]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-[#0A2540]">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#425466]">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
                Trust metrics built into the experience
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#425466] sm:text-lg">
                These are the signals we want borrowers to understand immediately when they land on the site.
              </p>
            </div>
            <Link
              href="/contact"
              className="premium-button inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Contact our team
            </Link>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-8">
                <p className="text-sm font-medium text-[#2563EB]">{metric.label}</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{metric.value}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#425466]">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#E3E8EE] bg-white p-8 text-center md:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
            Build your financing plan before you shop.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#425466] sm:text-lg">
            Start with a cleaner application flow, compare lenders with more context, and take that structure into
            the dealership conversation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/apply"
              className="premium-button inline-flex min-h-11 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Get pre-approved
            </Link>
            <Link
              href="/how-it-works"
              className="premium-button inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Review the process
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
