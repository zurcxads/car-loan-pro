"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Footer from "@/components/shared/Footer";

const TERMS = [24, 36, 48, 60, 72, 84];

function calculatePayment(principal: number, annualRate: number, months: number) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function generateAmortizationSchedule(principal: number, annualRate: number, months: number) {
  const schedule: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculatePayment(principal, annualRate, months);
  let balance = principal;

  for (let month = 1; month <= months; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function formatCurrencyFull(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(val);
}

function creditScoreLabel(score: number) {
  if (score >= 750) return "Excellent";
  if (score >= 700) return "Good";
  if (score >= 650) return "Fair";
  if (score >= 600) return "Poor";
  return "Very Poor";
}

function estimatedRate(score: number) {
  if (score >= 750) return 4.5;
  if (score >= 700) return 6.5;
  if (score >= 650) return 9.5;
  if (score >= 600) return 12.5;
  return 16.5;
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#E3E8EE]"
      style={{
        background: `linear-gradient(to right, #2563EB 0%, #2563EB ${percent}%, #E3E8EE ${percent}%, #E3E8EE 100%)`,
      }}
    />
  );
}

export default function CalculatorPage() {
  const vehiclePriceId = "vehicle-price";
  const downPaymentId = "down-payment";
  const creditScoreId = "credit-score";
  const [vehiclePrice, setVehiclePrice] = useState(35000);
  const [downPayment, setDownPayment] = useState(5000);
  const [creditScore, setCreditScore] = useState(700);
  const [termMonths, setTermMonths] = useState(60);
  const [showAmortization, setShowAmortization] = useState(false);

  useEffect(() => {
    document.title = "Auto Loan Calculator — Auto Loan Pro";
  }, []);

  const loanAmount = Math.max(0, vehiclePrice - downPayment);
  const interestRate = estimatedRate(creditScore);
  const dealerRate = interestRate + 3.0;

  useEffect(() => {
    if (downPayment > vehiclePrice) {
      setDownPayment(vehiclePrice);
    }
  }, [downPayment, vehiclePrice]);

  const results = useMemo(() => {
    const monthly = calculatePayment(loanAmount, interestRate, termMonths);
    const totalCost = monthly * termMonths;
    const totalInterest = totalCost - loanAmount;
    const totalWithDownPayment = totalCost + downPayment;
    return { monthly, totalCost, totalInterest, totalWithDownPayment };
  }, [downPayment, interestRate, loanAmount, termMonths]);

  const dealerResults = useMemo(() => {
    const monthly = calculatePayment(loanAmount, dealerRate, termMonths);
    const totalCost = monthly * termMonths;
    const totalInterest = totalCost - loanAmount;
    return { monthly, totalCost, totalInterest };
  }, [dealerRate, loanAmount, termMonths]);

  const savings = dealerResults.totalCost - results.totalCost;

  const amortizationSchedule = useMemo(
    () => generateAmortizationSchedule(loanAmount, interestRate, termMonths),
    [interestRate, loanAmount, termMonths],
  );

  return (
    <div className="min-h-screen bg-white text-[#425466]">
      <section className="px-6 py-20 pt-28 md:py-24 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-2 text-sm font-medium text-[#0A2540]">
              Auto loan calculator
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl">
              Estimate payments, compare rates, and inspect the full amortization schedule.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[#425466] sm:text-lg">
              Adjust price, down payment, credit score, and term to see how each change affects monthly payment and
              total borrowing cost.
            </p>
          </div>

          <div className="mt-16 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-xl border border-[#E3E8EE] bg-white p-8">
              <div className="sr-only" aria-live="polite">
                Estimated monthly payment {formatCurrencyFull(results.monthly)} at {interestRate.toFixed(2)} percent APR.
              </div>

              <h2 className="text-2xl font-semibold text-[#0A2540]">Loan details</h2>

              <div className="mt-8 space-y-8">
                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label htmlFor={vehiclePriceId} className="text-sm font-medium text-[#0A2540]">
                      Vehicle price
                    </label>
                    <div className="relative w-36">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6B7C93]">$</span>
                      <input
                        id={vehiclePriceId}
                        type="number"
                        value={vehiclePrice}
                        onChange={(e) => setVehiclePrice(Math.max(0, Math.min(200000, Number(e.target.value))))}
                        className="w-full rounded-xl border border-[#E3E8EE] bg-gray-50 py-3 pl-8 pr-4 text-right text-sm text-[#0A2540] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <Slider value={vehiclePrice} min={10000} max={200000} step={1000} onChange={setVehiclePrice} />
                  <div className="mt-2 flex justify-between text-sm text-[#6B7C93]">
                    <span>$10k</span>
                    <span>$200k</span>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label htmlFor={downPaymentId} className="text-sm font-medium text-[#0A2540]">
                      Down payment
                    </label>
                    <div className="relative w-36">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#6B7C93]">$</span>
                      <input
                        id={downPaymentId}
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Math.max(0, Math.min(vehiclePrice, Number(e.target.value))))}
                        className="w-full rounded-xl border border-[#E3E8EE] bg-gray-50 py-3 pl-8 pr-4 text-right text-sm text-[#0A2540] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <Slider value={downPayment} min={0} max={Math.max(vehiclePrice, 1)} step={500} onChange={setDownPayment} />
                  <div className="mt-2 flex justify-between text-sm text-[#6B7C93]">
                    <span>$0</span>
                    <span>{vehiclePrice > 0 ? ((downPayment / vehiclePrice) * 100).toFixed(0) : 0}% down</span>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <label htmlFor={creditScoreId} className="text-sm font-medium text-[#0A2540]">
                      Credit score
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id={creditScoreId}
                        type="number"
                        value={creditScore}
                        onChange={(e) => setCreditScore(Math.max(300, Math.min(850, Number(e.target.value))))}
                        className="w-24 rounded-xl border border-[#E3E8EE] bg-gray-50 px-4 py-3 text-right text-sm text-[#0A2540] focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-sm text-[#6B7C93]">{creditScoreLabel(creditScore)}</span>
                    </div>
                  </div>
                  <Slider value={creditScore} min={500} max={850} step={10} onChange={setCreditScore} />
                  <div className="mt-2 flex justify-between text-sm text-[#6B7C93]">
                    <span>500</span>
                    <span>850</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#2563EB]">Estimated APR: {interestRate.toFixed(2)}%</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#0A2540]">Loan term</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {TERMS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setTermMonths(term)}
                        aria-pressed={termMonths === term}
                        className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                          termMonths === term
                            ? "border-[#2563EB] bg-[#2563EB] text-white"
                            : "border-[#E3E8EE] bg-white text-[#0A2540] hover:bg-[#F6F9FC]"
                        }`}
                      >
                        {term} mo
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 self-start">
              <div className="rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-8">
                <p className="text-sm font-medium text-[#2563EB]">Estimated monthly payment</p>
                <p className="mt-4 text-5xl font-semibold tracking-tight text-[#0A2540]">
                  {formatCurrencyFull(results.monthly)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#425466]">
                  {termMonths} months at {interestRate.toFixed(2)}% APR on {formatCurrency(loanAmount)} financed.
                </p>
              </div>

              <div className="rounded-xl border border-[#E3E8EE] bg-white p-8">
                <h2 className="text-2xl font-semibold text-[#0A2540]">Cost summary</h2>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#6B7C93]">Vehicle price</span>
                    <span className="font-semibold text-[#0A2540]">{formatCurrency(vehiclePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#6B7C93]">Down payment</span>
                    <span className="font-semibold text-[#0A2540]">-{formatCurrency(downPayment)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#6B7C93]">Loan amount</span>
                    <span className="font-semibold text-[#0A2540]">{formatCurrency(loanAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#6B7C93]">Total interest</span>
                    <span className="font-semibold text-[#0A2540]">{formatCurrency(results.totalInterest)}</span>
                  </div>
                  <div className="border-t border-[#E3E8EE] pt-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#0A2540]">Total cost with down payment</span>
                      <span className="text-lg font-semibold text-[#0A2540]">
                        {formatCurrency(results.totalWithDownPayment)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/apply"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Get your real rate
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
              Compare a typical dealer markup against your estimated rate
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#425466] sm:text-lg">
              This comparison uses the same loan amount and term so you can isolate the impact of a higher APR.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#E3E8EE] bg-white p-8">
              <p className="text-sm font-medium text-[#6B7C93]">Typical dealer rate</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{dealerRate.toFixed(1)}% APR</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6B7C93]">Monthly payment</span>
                  <span className="font-semibold text-[#0A2540]">{formatCurrencyFull(dealerResults.monthly)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6B7C93]">Total interest</span>
                  <span className="font-semibold text-[#0A2540]">{formatCurrency(dealerResults.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6B7C93]">Total cost</span>
                  <span className="font-semibold text-[#0A2540]">{formatCurrency(dealerResults.totalCost)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E3E8EE] bg-white p-8">
              <p className="text-sm font-medium text-[#2563EB]">Estimated Auto Loan Pro rate</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-[#0A2540]">{interestRate.toFixed(1)}% APR</p>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6B7C93]">Monthly payment</span>
                  <span className="font-semibold text-[#0A2540]">{formatCurrencyFull(results.monthly)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6B7C93]">Total interest</span>
                  <span className="font-semibold text-[#0A2540]">{formatCurrency(results.totalInterest)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#6B7C93]">Total cost</span>
                  <span className="font-semibold text-[#0A2540]">{formatCurrency(results.totalCost)}</span>
                </div>
              </div>
              {savings > 0 && (
                <div className="mt-6 rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-5">
                  <p className="text-lg font-semibold text-[#0A2540]">Estimated savings: {formatCurrency(savings)}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#425466]">Over the life of the loan at the selected term.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
                Amortization schedule
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#425466] sm:text-lg">
                Inspect how each payment is split between principal and interest over time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAmortization(!showAmortization)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              aria-expanded={showAmortization}
              aria-controls="amortization-schedule"
            >
              {showAmortization ? "Hide schedule" : "Show schedule"}
              <ChevronDown className={`h-4 w-4 transition-transform ${showAmortization ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showAmortization && (
            <div id="amortization-schedule" className="mt-10 rounded-xl border border-[#E3E8EE] bg-white">
              <div className="max-h-[32rem] overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-[#F6F9FC]">
                    <tr className="border-b border-[#E3E8EE] text-left text-sm font-semibold text-[#0A2540]">
                      <th className="px-4 py-4">Month</th>
                      <th className="px-4 py-4 text-right">Payment</th>
                      <th className="px-4 py-4 text-right">Principal</th>
                      <th className="px-4 py-4 text-right">Interest</th>
                      <th className="px-4 py-4 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule.map((row, index) => (
                      <tr
                        key={row.month}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-[#F6F9FC]"} border-b border-[#E3E8EE] last:border-b-0`}
                      >
                        <td className="px-4 py-4 text-[#0A2540]">{row.month}</td>
                        <td className="px-4 py-4 text-right text-[#0A2540]">{formatCurrencyFull(row.payment)}</td>
                        <td className="px-4 py-4 text-right text-[#2563EB]">{formatCurrencyFull(row.principal)}</td>
                        <td className="px-4 py-4 text-right text-[#6B7C93]">{formatCurrencyFull(row.interest)}</td>
                        <td className="px-4 py-4 text-right text-[#0A2540]">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#E3E8EE] bg-white p-8 text-center md:p-12">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
            Ready to see real offers instead of estimates?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#425466] sm:text-lg">
            Use the calculator to frame your budget, then apply to compare lender terms built around your profile.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Get your real rate
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] transition-colors hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
