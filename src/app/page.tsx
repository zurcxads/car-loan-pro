"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, Building, CheckCircle, Check, X } from 'lucide-react';
import Footer from '@/components/shared/Footer';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

const valueProps = [
  { Icon: Zap, title: '2-Minute Application', desc: 'Done from your couch, not a dealer lot' },
  { Icon: CheckCircle, title: 'Instant Offers', desc: 'Multiple lenders in under 5 minutes' },
  { Icon: Lock, title: 'One Soft Pull', desc: 'No credit score impact, unlike dealer shopping' },
  { Icon: Building, title: 'Save 15+ Hours', desc: 'Skip dealership visits and bank appointments' },
];

const steps = [
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    title: 'Apply Once (2 min)',
    desc: 'One quick application. No dealer visits, no bank appointments, no running around town.'
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    title: 'Get Matched (instant)',
    desc: 'Lenders compete for your business in real-time. One soft pull, multiple instant offers.'
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Shop With Power',
    desc: 'Walk into any dealership pre-approved with a blank check. Negotiate from a position of strength.'
  },
];

const tiers = [
  { name: 'Prime', range: '700+', rate: '3.49 - 5.99%', color: 'bg-blue-500' },
  { name: 'Near-Prime', range: '620 - 699', rate: '5.99 - 8.49%', color: 'bg-blue-500' },
  { name: 'Subprime', range: '520 - 619', rate: '8.99 - 14.99%', color: 'bg-blue-400' },
  { name: 'Specialty', range: 'All scores', rate: '6.99 - 12.99%', color: 'bg-gray-400' },
];

const trustSignals = [
  '256-bit SSL Encryption',
  'Soft Pull Only',
  'FCRA Compliant',
  'Free for Consumers'
];

const faqs = [
  { q: 'Does checking my rate affect my credit score?', a: 'No. We use a soft credit inquiry to match you with lenders, which does not impact your credit score. A hard inquiry only occurs if you select an offer and proceed with a specific lender.' },
  { q: 'How many lenders will see my application?', a: 'Your application is sent to up to 8 lenders in our network that match your credit profile and loan requirements. You\'ll only see offers from lenders who pre-approve you.' },
  { q: 'Are there any fees?', a: 'Auto Loan Pro is completely free for consumers. We earn a referral fee from lenders when a loan is funded, which means our incentives are aligned with getting you the best deal.' },
  { q: 'What credit score do I need?', a: 'We work with lenders across the full credit spectrum, from prime (700+) to specialty lenders that accept all credit types. There is no minimum score to apply.' },
  { q: 'How long does the process take?', a: 'Most applicants receive their first offers within 2 minutes of submitting. The entire process from application to pre-approval takes under 5 minutes.' },
];

const creditScoreRanges = [
  { label: 'Fair (580-669)', value: 'fair', rateRange: [8.99, 14.99], avgRate: 11.99 },
  { label: 'Good (670-739)', value: 'good', rateRange: [5.99, 8.99], avgRate: 7.49 },
  { label: 'Very Good (740-799)', value: 'very_good', rateRange: [4.49, 5.99], avgRate: 5.24 },
  { label: 'Excellent (800+)', value: 'excellent', rateRange: [3.49, 4.99], avgRate: 4.24 }
];

function RateCalculator() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(25000);
  const [creditRange, setCreditRange] = useState('good');
  const loanAmountInputId = 'homepage-rate-loan-amount';
  const paymentEstimateId = 'homepage-rate-payment-estimate';

  const selectedCredit = creditScoreRanges.find(c => c.value === creditRange) || creditScoreRanges[1];
  const termMonths = 60;

  // Calculate monthly payment range
  const calculatePayment = (amount: number, apr: number, months: number) => {
    const monthlyRate = apr / 100 / 12;
    if (monthlyRate === 0) return amount / months;
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const minPayment = Math.round(calculatePayment(loanAmount, selectedCredit.rateRange[0], termMonths));
  const maxPayment = Math.round(calculatePayment(loanAmount, selectedCredit.rateRange[1], termMonths));
  const avgPayment = Math.round(calculatePayment(loanAmount, selectedCredit.avgRate, termMonths));

  return (
    <section className="py-16 md:py-24 px-6 bg-gray-50 ">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-8">
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 ">Estimate Your Rate</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-gray-600  text-sm">See what you might qualify for without applying</motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-white  rounded-2xl border border-gray-200  p-6 sm:p-8 shadow-sm"
        >
          {/* Loan Amount Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor={loanAmountInputId} className="text-sm font-medium text-gray-700 ">Loan Amount</label>
              <span className="text-2xl font-bold text-blue-600">${loanAmount.toLocaleString()}</span>
            </div>
            <input
              id={loanAmountInputId}
              type="range"
              min="10000"
              max="75000"
              step="1000"
              value={loanAmount}
              onChange={e => setLoanAmount(Number(e.target.value))}
              aria-describedby={paymentEstimateId}
              className="w-full h-2 bg-gray-200  rounded-lg appearance-none cursor-pointer accent-blue-600"
              style={{
                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((loanAmount - 10000) / (75000 - 10000)) * 100}%, #e5e7eb ${((loanAmount - 10000) / (75000 - 10000)) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500  mt-2">
              <span>$10,000</span>
              <span>$75,000</span>
            </div>
          </div>

          {/* Credit Score Range */}
          <div className="mb-8">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700  mb-3">Estimated Credit Score</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {creditScoreRanges.map(range => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setCreditRange(range.value)}
                  className={`px-3 py-3 min-h-[44px] text-xs font-medium rounded-lg border transition-all ${
                    creditRange === range.value
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-gray-50  border-gray-200  text-gray-800  hover:border-gray-300  focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                  }`}
                  aria-pressed={creditRange === range.value}
                >
                  {range.label}
                </button>
              ))}
            </div>
            </fieldset>
          </div>

          {/* Results */}
          <div id={paymentEstimateId} aria-live="polite" className="bg-gradient-to-br from-blue-50 to-blue-100   rounded-xl p-6 mb-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-blue-700  font-medium mb-2">Estimated APR Range</div>
                <div className="text-3xl font-bold text-gray-900 ">
                  {selectedCredit.rateRange[0].toFixed(2)}% - {selectedCredit.rateRange[1].toFixed(2)}%
                </div>
                <div className="text-xs text-gray-700  mt-1">Based on {selectedCredit.label.split(' ')[0]} credit</div>
              </div>
              <div>
                <div className="text-xs text-blue-700  font-medium mb-2">Estimated Monthly Payment</div>
                <div className="text-3xl font-bold text-gray-900 ">
                  ${avgPayment.toLocaleString()}
                </div>
                <div className="text-xs text-gray-700  mt-1">Range: ${minPayment.toLocaleString()} - ${maxPayment.toLocaleString()}/mo for 60 months</div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50  border border-gray-200  rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-700  text-center">
              <strong>Estimates only.</strong> Apply to see your actual offers. Rates shown are illustrative and based on market averages. Your actual rate will depend on your credit profile, vehicle, and lender.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/apply')}
            className="w-full px-8 py-4 min-h-[48px] bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            See Your Real Offers — Takes 2 Minutes
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [returningVisitor, setReturningVisitor] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Mini hero form state
  const [heroForm, setHeroForm] = useState({ name: '', creditRange: '', loanAmount: '' });

  // Check for returning visitor (has session token in localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionToken = localStorage.getItem('alp_session_token');
      const appId = localStorage.getItem('clp_current_app_id');
      if (sessionToken || appId) {
        setReturningVisitor(true);
        setShowBanner(true);
      }
    }
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass data to apply page via URL params
    const params = new URLSearchParams();
    if (heroForm.name) params.set('name', heroForm.name);
    if (heroForm.creditRange) params.set('creditRange', heroForm.creditRange);
    if (heroForm.loanAmount) params.set('loanAmount', heroForm.loanAmount);
    router.push(`/apply?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-16">{/* Padding for fixed header */}

      {/* Return Visitor Banner */}
      <AnimatePresence>
        {showBanner && returningVisitor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-500 shadow-lg"
          >
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Welcome back!</p>
                  <p className="text-blue-100 text-xs">Continue where you left off</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Dashboard
                </Link>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-1 text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero - Tool as Hero */}
      <section className={`pt-24 pb-16 px-6 ${showBanner && returningVisitor ? 'mt-14' : ''}`}>
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Save 15+ hours — get pre-approved in 2 minutes
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-gray-900  mb-6">
                Pre-Approved in 2 Minutes,<br />Not 2 Weeks
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-gray-700  leading-relaxed font-light mb-8">
                Skip the dealership runaround. One application, multiple competing lenders, instant offers. What takes weeks the traditional way takes minutes with us.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-700 ">
                  <Check className="h-5 w-5 text-blue-500" />
                  No dealer visits
                </div>
                <div className="flex items-center gap-2 text-gray-700 ">
                  <Check className="h-5 w-5 text-blue-500" />
                  Soft credit pull only
                </div>
                <div className="flex items-center gap-2 text-gray-700 ">
                  <Check className="h-5 w-5 text-blue-500" />
                  Free for consumers
                </div>
              </motion.div>
            </div>

            {/* Right: Mini Form */}
            <motion.div variants={fadeUp}>
              <form onSubmit={handleHeroSubmit} className="bg-white  rounded-2xl border border-gray-200  shadow-lg p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900  mb-1">Get Your Rate</h2>
                <p className="text-sm text-gray-600  mb-6">Takes about 2 minutes. No credit score impact.</p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="hero-name" className="block text-xs text-gray-600  mb-2 font-medium">Your Name</label>
                    <input
                      id="hero-name"
                      type="text"
                      value={heroForm.name}
                      onChange={e => setHeroForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 bg-gray-50  border border-gray-200  rounded-xl text-sm text-gray-900  placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="hero-credit-range" className="block text-xs text-gray-600  mb-2 font-medium">Estimated Credit Score</label>
                    <select
                      id="hero-credit-range"
                      value={heroForm.creditRange}
                      onChange={e => setHeroForm(f => ({ ...f, creditRange: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50  border border-gray-200  rounded-xl text-sm text-gray-900  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors cursor-pointer"
                    >
                      <option value="">Select range</option>
                      <option value="excellent">Excellent (800+)</option>
                      <option value="very_good">Very Good (740-799)</option>
                      <option value="good">Good (670-739)</option>
                      <option value="fair">Fair (580-669)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hero-loan-amount" className="block text-xs text-gray-600  mb-2 font-medium">Desired Loan Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        id="hero-loan-amount"
                        type="text"
                        value={heroForm.loanAmount}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setHeroForm(f => ({ ...f, loanAmount: val }));
                        }}
                        placeholder="30,000"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50  border border-gray-200  rounded-xl text-sm text-gray-900  placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 min-h-[48px] bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Check My Rate — Free
                  </button>

                  <p className="text-xs text-gray-600  text-center">
                    By continuing, you agree to our <Link href="/terms" className="underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">Terms</Link> and <Link href="/privacy" className="underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">Privacy Policy</Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Value Props - 2x2 grid on mobile */}
      <section className="py-12 border-y border-gray-200  bg-white ">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {valueProps.map((prop, i) => (
            <motion.div key={i} variants={fadeUp} className="text-center">
              <div className="flex justify-center mb-3">
                <prop.Icon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900  mb-1">{prop.title}</div>
              <div className="text-xs text-gray-600  leading-relaxed">{prop.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="py-6 bg-blue-50 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-blue-700 font-medium">
            {trustSignals.map((signal, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {signal}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Time Savings Comparison */}
      <section className="py-16 md:py-24 px-6 bg-gray-50 ">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 ">The Old Way vs Auto Loan Pro</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-gray-600  text-sm">The average car buyer spends 15+ hours on financing. We cut that to under 5 minutes.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} className="bg-white  rounded-2xl border border-gray-200  p-8">
              <div className="text-xs text-red-600 mb-3 uppercase tracking-wider font-medium">Traditional Route</div>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="text-sm text-gray-700 ">Drive to 3-5 dealerships (10-20 hours)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="text-sm text-gray-700 ">Visit bank or credit union (2-4 hours + wait days for appointment)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="text-sm text-gray-700 ">Apply at multiple lenders (1-2 hours each)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="text-sm text-gray-700 ">Multiple hard credit pulls (damages your score)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="text-sm text-gray-700 ">Dealer F&I office negotiation (2-4 hours)</div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 ">
                <div className="text-sm text-gray-700 ">Total Time:</div>
                <div className="text-3xl font-bold text-red-600">15-30+ hours</div>
                <div className="text-xs text-gray-500  mt-1">Spread over 1-3 weeks</div>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-gradient-to-br from-blue-50 to-blue-100   rounded-2xl border-2 border-blue-200  p-8">
              <div className="text-xs text-blue-600  mb-3 uppercase tracking-wider font-medium">Auto Loan Pro</div>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-900  font-medium">2-minute application from your couch</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-900  font-medium">Instant offers from multiple lenders</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-900  font-medium">One soft pull (no credit impact)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-900  font-medium">Pre-approved before visiting ANY dealer</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-sm text-gray-900  font-medium">Walk in with financing locked in</div>
                </div>
              </div>
              <div className="pt-4 border-t border-blue-300 ">
                <div className="text-sm text-gray-700 ">Total Time:</div>
                <div className="text-3xl font-bold text-blue-600">Under 5 minutes</div>
                <div className="text-xs text-gray-700  mt-1">Done from your couch</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-gray-600 text-sm">At a dealership, this takes 3-5 visits. With us, it takes one coffee break.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="relative p-7 rounded-2xl surface surface-hover">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {s.icon}
                </div>
                <div className="absolute top-7 right-7 text-5xl font-bold text-gray-100">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed relative z-10">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lender Tiers */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900">Lenders For Every Credit Profile</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-gray-600 text-sm">Our network covers the full credit spectrum</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tiers.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-5 p-5 rounded-2xl surface surface-hover">
                <div className={`w-1.5 h-14 rounded-full ${t.color}`} />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-600 mt-0.5">FICO {t.range}</div>
                </div>
                <div className="text-sm text-gray-600 font-mono tracking-tight">{t.rate}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Rate Comparison */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12">Dealer vs Auto Loan Pro</motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} className="p-8 rounded-2xl surface">
              <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">Average Dealer Rate</div>
              <div className="text-5xl font-bold text-red-500">7.9%</div>
              <div className="text-xs text-gray-500 mt-3">On a $30,000 / 60-month loan</div>
              <div className="text-xl font-semibold mt-4 text-gray-600">$607/mo</div>
            </motion.div>
            <motion.div variants={fadeUp} className="p-8 rounded-2xl border border-blue-200 bg-blue-50">
              <div className="text-xs text-blue-600 mb-3 uppercase tracking-wider font-medium">Auto Loan Pro Avg Rate</div>
              <div className="text-5xl font-bold text-blue-600">4.1%</div>
              <div className="text-xs text-gray-500 mt-3">On a $30,000 / 60-month loan</div>
              <div className="text-xl font-semibold mt-4 text-gray-900">$554/mo</div>
              <div className="mt-2 text-xs font-medium text-blue-600">Save $3,180 over the life of the loan</div>
            </motion.div>
          </motion.div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xs text-gray-500 mt-8">
            * Illustrative example only. Actual rates vary based on credit profile, vehicle, and lender. Rates shown are for comparison purposes.
          </motion.p>
        </div>
      </section>


      {/* Interactive Rate Calculator */}
      <RateCalculator />

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</motion.h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`homepage-faq-panel-${i}`}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset">
                  {faq.q}
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div id={`homepage-faq-panel-${i}`} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to save on your auto loan?</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-600 mb-10">Get pre-approved in minutes with no impact to your credit score.</motion.p>
            <motion.div variants={fadeUp} className="w-full sm:w-auto">
              <Link href="/apply" className="inline-flex w-full sm:w-auto justify-center px-8 py-4 min-h-[48px] items-center bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                Check Your Rate — Free
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 text-xs text-gray-500">No credit impact. No obligation.</motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
