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

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

function formatCurrencyFull(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
}

export default function CalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(30000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [termMonths, setTermMonths] = useState(60);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const results = useMemo(() => {
    const monthly = calculatePayment(loanAmount, interestRate, termMonths);
    const totalCost = monthly * termMonths;
    const totalInterest = totalCost - loanAmount;
    return { monthly, totalCost, totalInterest };
  }, [loanAmount, interestRate, termMonths]);

  // Comparison: dealer rate is typically 2-4% higher
  const dealerRate = interestRate + 3.0;
  const dealerResults = useMemo(() => {
    const monthly = calculatePayment(loanAmount, dealerRate, termMonths);
    const totalCost = monthly * termMonths;
    const totalInterest = totalCost - loanAmount;
    return { monthly, totalCost, totalInterest };
  }, [loanAmount, dealerRate, termMonths]);

  const savings = dealerResults.totalCost - results.totalCost;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link href="/how-it-works" className="hover:text-gray-900 transition-colors duration-200">How It Works</Link>
            <Link href="/calculator" className="text-gray-900 font-medium">Calculator</Link>
            <Link href="#" className="hover:text-gray-900 transition-colors duration-200">Resources</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors duration-200">Sign In</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/apply" className="hidden md:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Apply Now
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-gray-500 cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white px-6 py-4 flex flex-col gap-4 text-sm">
            <Link href="/how-it-works" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>How It Works</Link>
            <Link href="/calculator" className="text-gray-900 font-medium" onClick={() => setMobileMenu(false)}>Calculator</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Resources</Link>
            <Link href="/login" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Sign In</Link>
            <Link href="/apply" className="mt-2 text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white" onClick={() => setMobileMenu(false)}>Apply Now</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto text-center">
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            Auto Loan Calculator
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-500 max-w-xl mx-auto font-light">
            Estimate your monthly payment and see how much you could save with Auto Loan Pro.
          </motion.p>
        </motion.div>
      </section>

      {/* Calculator */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-5 gap-8">
            {/* Inputs */}
            <motion.div variants={fadeUp} className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-8">Loan Details</h2>

              {/* Loan Amount */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-600 font-medium">Loan Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={e => setLoanAmount(Math.max(0, Math.min(150000, Number(e.target.value))))}
                      className="w-32 pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={150000}
                  step={500}
                  value={loanAmount}
                  onChange={e => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                  <span>$5,000</span>
                  <span>$150,000</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-600 font-medium">Interest Rate (APR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={interestRate}
                      onChange={e => setInterestRate(Math.max(0, Math.min(30, Number(e.target.value))))}
                      step={0.1}
                      className="w-24 pr-7 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.1}
                  value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                  <span>0%</span>
                  <span>25%</span>
                </div>
              </div>

              {/* Loan Term */}
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-3">Loan Term</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TERMS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTermMonths(t)}
                      className={`py-3 text-sm rounded-xl border transition-colors duration-200 cursor-pointer ${
                        termMonths === t
                          ? 'bg-blue-600 border-blue-600 text-white font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t} mo
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
                <div className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-2">Estimated Monthly Payment</div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{formatCurrencyFull(results.monthly)}</div>
                <div className="text-xs text-gray-500">{termMonths} months at {interestRate}% APR</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8 space-y-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Loan Amount</span>
                  <span className="font-medium text-gray-900">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Interest</span>
                  <span className="font-medium text-gray-900">{formatCurrency(results.totalInterest)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Total Cost</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(results.totalCost)}</span>
                </div>
              </div>
              <Link href="/apply" className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200 text-center">
                Check Your Rate — Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Savings Comparison */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">See What You Could Save</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 text-center mb-12 text-sm">Typical dealer markup vs. Auto Loan Pro competitive rate</motion.p>
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">Typical Dealer Rate</div>
                <div className="text-3xl font-bold text-red-500 mb-1">{dealerRate.toFixed(1)}% APR</div>
                <div className="text-sm text-gray-500 mb-6">{termMonths} months on {formatCurrency(loanAmount)}</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Payment</span>
                    <span className="font-medium text-gray-900">{formatCurrencyFull(dealerResults.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Interest</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dealerResults.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Cost</span>
                    <span className="font-medium text-gray-900">{formatCurrency(dealerResults.totalCost)}</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
                <div className="text-xs text-blue-600 uppercase tracking-wider font-medium mb-4">Auto Loan Pro Rate</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{interestRate.toFixed(1)}% APR</div>
                <div className="text-sm text-gray-500 mb-6">{termMonths} months on {formatCurrency(loanAmount)}</div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monthly Payment</span>
                    <span className="font-medium text-gray-900">{formatCurrencyFull(results.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Interest</span>
                    <span className="font-medium text-gray-900">{formatCurrency(results.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Cost</span>
                    <span className="font-medium text-gray-900">{formatCurrency(results.totalCost)}</span>
                  </div>
                </div>
                {savings > 0 && (
                  <div className="mt-6 pt-4 border-t border-blue-200">
                    <div className="text-green-600 font-semibold text-lg">You save {formatCurrency(savings)}</div>
                    <div className="text-xs text-gray-500">over the life of the loan</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-2xl mx-auto text-center">
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to get your real rate?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 mb-10">These are estimates. Apply to see actual offers from competing lenders.</motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/apply" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200">
              Check Your Rate — Free
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-4 text-xs text-gray-400">No credit impact. No obligation.</motion.p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div>
            <div className="font-semibold text-gray-900 mb-4">Product</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/how-it-works" className="block hover:text-gray-900 transition-colors duration-200">How It Works</Link>
              <Link href="/calculator" className="block hover:text-gray-900 transition-colors duration-200">Calculator</Link>
              <Link href="/apply" className="block hover:text-gray-900 transition-colors duration-200">Apply Now</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-4">Company</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/about" className="block hover:text-gray-900 transition-colors duration-200">About</Link>
              <Link href="/contact" className="block hover:text-gray-900 transition-colors duration-200">Contact</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-4">Legal</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/privacy" className="block hover:text-gray-900 transition-colors duration-200">Privacy Policy</Link>
              <Link href="/terms" className="block hover:text-gray-900 transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-4">Support</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/login" className="block hover:text-gray-900 transition-colors duration-200">Sign In</Link>
              <Link href="/contact" className="block hover:text-gray-900 transition-colors duration-200">Help Center</Link>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-8 border-t border-gray-200 text-xs text-gray-400 text-center">
          Auto Loan Pro is not a lender. Offers are subject to credit approval. NMLS #000000
        </div>
      </footer>
    </div>
  );
}
