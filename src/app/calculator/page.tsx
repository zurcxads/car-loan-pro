"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

function formatCurrencyFull(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
}

export default function CalculatorPage() {
  const [vehiclePrice, setVehiclePrice] = useState(35000);
  const [downPayment, setDownPayment] = useState(5000);
  const [creditScore, setCreditScore] = useState(700);
  const [termMonths, setTermMonths] = useState(60);
  const [showAmortization, setShowAmortization] = useState(false);

  const loanAmount = Math.max(0, vehiclePrice - downPayment);

  // Rate based on credit score (simplified model)
  const getInterestRate = (score: number) => {
    if (score >= 750) return 4.5;
    if (score >= 700) return 6.5;
    if (score >= 650) return 9.5;
    if (score >= 600) return 12.5;
    return 16.5;
  };

  const interestRate = getInterestRate(creditScore);

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
  }, [loanAmount, interestRate, termMonths, downPayment]);

  // Comparison: dealer rate is typically 2-4% higher
  const dealerRate = interestRate + 3.0;
  const dealerResults = useMemo(() => {
    const monthly = calculatePayment(loanAmount, dealerRate, termMonths);
    const totalCost = monthly * termMonths;
    const totalInterest = totalCost - loanAmount;
    return { monthly, totalCost, totalInterest };
  }, [loanAmount, dealerRate, termMonths]);

  const savings = dealerResults.totalCost - results.totalCost;

  const amortizationSchedule = useMemo(() => {
    return generateAmortizationSchedule(loanAmount, interestRate, termMonths);
  }, [loanAmount, interestRate, termMonths]);

  const creditScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="pt-28 pb-12 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto text-center">
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Auto Loan Calculator
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-500 dark:text-zinc-400 max-w-xl mx-auto font-light">
            Estimate your monthly payment and see how much you could save with Auto Loan Pro.
          </motion.p>
        </motion.div>
      </section>

      {/* Calculator */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="sr-only" aria-live="polite">
            Estimated monthly payment {formatCurrencyFull(results.monthly)} at {interestRate.toFixed(2)} percent APR.
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-5 gap-8">
            {/* Inputs */}
            <motion.div variants={fadeUp} className="lg:col-span-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-8">Loan Details</h2>

              {/* Vehicle Price */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor={vehiclePriceId} className="text-sm text-gray-700 dark:text-zinc-200 font-medium">Vehicle Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id={vehiclePriceId}
                      type="number"
                      value={vehiclePrice}
                      onChange={e => setVehiclePrice(Math.max(0, Math.min(200000, Number(e.target.value))))}
                      className="w-32 pl-7 pr-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-right text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={200000}
                  step={1000}
                  value={vehiclePrice}
                  onChange={e => setVehiclePrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
                  <span>$10k</span>
                  <span>$200k</span>
                </div>
              </div>

              {/* Down Payment */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor={downPaymentId} className="text-sm text-gray-700 dark:text-zinc-200 font-medium">Down Payment</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id={downPaymentId}
                      type="number"
                      value={downPayment}
                      onChange={e => setDownPayment(Math.max(0, Math.min(vehiclePrice, Number(e.target.value))))}
                      className="w-32 pl-7 pr-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-right text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={vehiclePrice}
                  step={500}
                  value={downPayment}
                  onChange={e => setDownPayment(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
                  <span>$0</span>
                  <span>{vehiclePrice > 0 ? ((downPayment / vehiclePrice) * 100).toFixed(0) : 0}% down</span>
                </div>
              </div>

              {/* Credit Score */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor={creditScoreId} className="text-sm text-gray-700 dark:text-zinc-200 font-medium">Credit Score</label>
                  <div className="flex items-center gap-2">
                    <input
                      id={creditScoreId}
                      type="number"
                      value={creditScore}
                      onChange={e => setCreditScore(Math.max(300, Math.min(850, Number(e.target.value))))}
                      className="w-20 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-right text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    />
                    <span className="text-xs text-gray-600 dark:text-zinc-300">({creditScoreLabel(creditScore)})</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={500}
                  max={850}
                  step={10}
                  value={creditScore}
                  onChange={e => setCreditScore(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
                  <span>500</span>
                  <span>850</span>
                </div>
                <div className="mt-2 text-xs text-blue-700">Estimated APR: {interestRate.toFixed(2)}%</div>
              </div>

              {/* Loan Term */}
              <div>
                <div className="text-sm text-gray-700 dark:text-zinc-200 font-medium block mb-3">Loan Term</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TERMS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTermMonths(t)}
                      className={`py-3 text-sm rounded-xl border transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                        termMonths === t
                          ? 'bg-blue-600 border-blue-600 text-white font-medium'
                          : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900'
                      }`}
                      aria-pressed={termMonths === t}
                    >
                      {t} mo
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-8">
                <div className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-2">Estimated Monthly Payment</div>
                <div className="text-4xl font-bold text-gray-900 dark:text-zinc-100 mb-1">{formatCurrencyFull(results.monthly)}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">{termMonths} months at {interestRate.toFixed(2)}% APR</div>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-8 space-y-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-zinc-400">Vehicle Price</span>
                  <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrency(vehiclePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-zinc-400">Down Payment</span>
                  <span className="font-medium text-gray-900 dark:text-zinc-100">-{formatCurrency(downPayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-zinc-400">Loan Amount</span>
                  <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-zinc-400">Total Interest</span>
                  <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrency(results.totalInterest)}</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-zinc-800" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300 font-medium">Total Cost</span>
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">{formatCurrency(results.totalWithDownPayment)}</span>
                </div>
              </div>
              <Link href="/apply" className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200 text-center">
                Get Your Real Rate
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Savings Comparison */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 text-center mb-3">See What You Could Save</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-zinc-400 text-center mb-12 text-sm">Typical dealer markup vs. Auto Loan Pro competitive rate</motion.p>
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8">
                <div className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-medium mb-4">Typical Dealer Rate</div>
                <div className="text-3xl font-bold text-red-500 mb-1">{dealerRate.toFixed(1)}% APR</div>
                <div className="text-sm text-gray-500 dark:text-zinc-400 mb-6">{termMonths} months on {formatCurrency(loanAmount)}</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Monthly Payment</span>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrencyFull(dealerResults.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Total Interest</span>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrency(dealerResults.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Total Cost</span>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrency(dealerResults.totalCost)}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-8">
                <div className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-4">Auto Loan Pro Rate</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{interestRate.toFixed(1)}% APR</div>
                <div className="text-sm text-gray-500 dark:text-zinc-400 mb-6">{termMonths} months on {formatCurrency(loanAmount)}</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Monthly Payment</span>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrencyFull(results.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Total Interest</span>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrency(results.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">Total Cost</span>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">{formatCurrency(results.totalCost)}</span>
                  </div>
                </div>
                {savings > 0 && (
                  <div className="mt-6 pt-4 border-t border-blue-200">
                    <div className="text-lg font-semibold text-blue-600">You save {formatCurrency(savings)}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400">over the life of the loan</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Amortization Schedule */}
      <section className="py-16 px-6 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-3">Amortization Schedule</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">See how your payments break down over time</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full mb-4 px-6 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-zinc-100 text-sm font-medium rounded-xl transition-colors flex items-center justify-between"
              >
                <span>{showAmortization ? 'Hide' : 'Show'} Payment Schedule</span>
                <svg className={`w-5 h-5 transition-transform ${showAmortization ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showAmortization && (
                <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-zinc-900 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Month</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Payment</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Principal</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Interest</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                        {amortizationSchedule.map((row, idx) => (
                          <tr key={row.month} className={idx % 2 === 0 ? 'bg-white dark:bg-zinc-900/50' : 'bg-gray-50 dark:bg-zinc-900'}>
                            <td className="px-4 py-3 text-gray-900 dark:text-zinc-100">{row.month}</td>
                            <td className="px-4 py-3 text-right text-gray-900 dark:text-zinc-100">{formatCurrencyFull(row.payment)}</td>
                            <td className="px-4 py-3 text-right text-blue-600">{formatCurrencyFull(row.principal)}</td>
                            <td className="px-4 py-3 text-right text-red-500">{formatCurrencyFull(row.interest)}</td>
                            <td className="px-4 py-3 text-right text-gray-900 dark:text-zinc-100">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-zinc-900/50">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-2xl mx-auto text-center">
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-4">Ready to get your real rate?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 dark:text-zinc-400 mb-10">These are estimates. Apply to see actual offers from competing lenders.</motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/apply" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200">
              Get Your Real Rate
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-4 text-xs text-gray-400 dark:text-zinc-500">No credit impact. No obligation.</motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 py-12 px-6 bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div>
            <div className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">Product</div>
            <div className="space-y-3 text-gray-500 dark:text-zinc-400">
              <Link href="/how-it-works" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">How It Works</Link>
              <Link href="/calculator" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Calculator</Link>
              <Link href="/apply" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Apply Now</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">Company</div>
            <div className="space-y-3 text-gray-500 dark:text-zinc-400">
              <Link href="/about" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">About</Link>
              <Link href="/contact" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Contact</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">Legal</div>
            <div className="space-y-3 text-gray-500 dark:text-zinc-400">
              <Link href="/privacy" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">Support</div>
            <div className="space-y-3 text-gray-500 dark:text-zinc-400">
              <Link href="/login" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Sign In</Link>
              <Link href="/contact" className="block hover:text-gray-900 dark:hover:text-zinc-100 transition-colors duration-200">Help Center</Link>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-8 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-400 dark:text-zinc-500 text-center">
          Auto Loan Pro is not a lender. Offers are subject to credit approval. NMLS #000000
        </div>
      </footer>
    </div>
  );
}
