"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '@/components/shared/Footer';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

const valueProps = [
  { icon: '🔒', title: 'No Credit Impact', desc: 'Soft pull only — won\'t affect your score' },
  { icon: '⚡', title: '2-Minute Application', desc: 'Quick and easy online process' },
  { icon: '🏦', title: 'Multiple Lenders', desc: 'Compare offers from our network' },
  { icon: '✓', title: 'Pre-Approved in Minutes', desc: 'Get your answer fast' },
];

const steps = [
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    title: 'Apply Once',
    desc: 'Fill out a single application in 4 steps. No dealer visits, no phone calls, no obligation.'
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    title: 'Lenders Compete',
    desc: 'Your profile is matched to our network of lenders who compete for your loan.'
  },
  {
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Get Pre-Approved',
    desc: 'Review multiple offers side-by-side and walk into the dealership with financing locked in.'
  },
];

const tiers = [
  { name: 'Prime', range: '700+', rate: '3.49 - 5.99%', color: 'bg-green-500' },
  { name: 'Near-Prime', range: '620 - 699', rate: '5.99 - 8.49%', color: 'bg-blue-500' },
  { name: 'Subprime', range: '520 - 619', rate: '8.99 - 14.99%', color: 'bg-amber-500' },
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

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Mini hero form state
  const [heroForm, setHeroForm] = useState({ name: '', creditRange: '', loanAmount: '' });

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
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
    <div className="min-h-screen">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link href="/how-it-works" className="hover:text-gray-900 transition-colors duration-200">How It Works</Link>
            <Link href="/calculator" className="hover:text-gray-900 transition-colors duration-200">Calculator</Link>
            <Link href="/resources" className="hover:text-gray-900 transition-colors duration-200">Resources</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors duration-200">Sign In</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/apply" className="hidden md:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer">
              Apply Now
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-gray-500 cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
              <div className="px-6 py-4 flex flex-col gap-4 text-sm">
                {[['How It Works', '/how-it-works'], ['Calculator', '/calculator'], ['Resources', '/resources'], ['Sign In', '/login']].map(([label, href]) => (
                  <Link key={label} href={href} className="text-gray-500 hover:text-gray-900 py-1 transition-colors duration-200" onClick={() => setMobileMenu(false)}>{label}</Link>
                ))}
                <Link href="/apply" className="mt-2 text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white" onClick={() => setMobileMenu(false)}>Apply Now</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero - Tool as Hero */}
      <section className="pt-24 pb-16 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                No credit impact — check in under 5 minutes
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-gray-900 mb-6">
                Stop overpaying<br />at the dealer
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-gray-500 leading-relaxed font-light mb-8">
                One application. Multiple lenders competing for your auto loan. Get pre-approved in minutes with no impact to your credit score.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  No dealer visits
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Soft credit pull only
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Free for consumers
                </div>
              </motion.div>
            </div>

            {/* Right: Mini Form */}
            <motion.div variants={fadeUp}>
              <form onSubmit={handleHeroSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Get Your Rate</h3>
                <p className="text-sm text-gray-500 mb-6">Takes less than 5 minutes. No credit impact.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium">Your Name</label>
                    <input
                      type="text"
                      value={heroForm.name}
                      onChange={e => setHeroForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium">Estimated Credit Score</label>
                    <select
                      value={heroForm.creditRange}
                      onChange={e => setHeroForm(f => ({ ...f, creditRange: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="">Select range</option>
                      <option value="750+">Excellent (750+)</option>
                      <option value="700-749">Good (700-749)</option>
                      <option value="650-699">Fair (650-699)</option>
                      <option value="600-649">Poor (600-649)</option>
                      <option value="<600">Very Poor (&lt;600)</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2 font-medium">Desired Loan Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="text"
                        value={heroForm.loanAmount}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setHeroForm(f => ({ ...f, loanAmount: val }));
                        }}
                        placeholder="30,000"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Check My Rate — Free
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    By continuing, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Value Props */}
      <section className="py-12 border-y border-gray-200 bg-white">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {valueProps.map((prop, i) => (
            <motion.div key={i} variants={fadeUp} className="text-center">
              <div className="text-3xl mb-3">{prop.icon}</div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{prop.title}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{prop.desc}</div>
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

      {/* How it Works */}
      <section id="how-it-works" className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-gray-500 text-sm">Three steps to a better auto loan</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="relative p-7 rounded-2xl surface surface-hover">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {s.icon}
                </div>
                <div className="absolute top-7 right-7 text-5xl font-bold text-gray-100">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 relative z-10">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed relative z-10">{s.desc}</p>
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
            <motion.p variants={fadeUp} className="mt-3 text-gray-500 text-sm">Our network covers the full credit spectrum</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 gap-4">
            {tiers.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-5 p-5 rounded-2xl surface surface-hover">
                <div className={`w-1.5 h-14 rounded-full ${t.color}`} />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">FICO {t.range}</div>
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} className="p-8 rounded-2xl surface">
              <div className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">Average Dealer Rate</div>
              <div className="text-5xl font-bold text-red-500">7.9%</div>
              <div className="text-xs text-gray-400 mt-3">On a $30,000 / 60-month loan</div>
              <div className="text-xl font-semibold mt-4 text-gray-600">$607/mo</div>
            </motion.div>
            <motion.div variants={fadeUp} className="p-8 rounded-2xl border border-blue-200 bg-blue-50">
              <div className="text-xs text-blue-600 mb-3 uppercase tracking-wider font-medium">Auto Loan Pro Avg Rate</div>
              <div className="text-5xl font-bold text-blue-600">4.1%</div>
              <div className="text-xs text-gray-400 mt-3">On a $30,000 / 60-month loan</div>
              <div className="text-xl font-semibold mt-4 text-gray-900">$554/mo</div>
              <div className="text-xs text-green-600 mt-2 font-medium">Save $3,180 over the life of the loan</div>
            </motion.div>
          </motion.div>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-xs text-gray-400 mt-8">
            * Illustrative example only. Actual rates vary based on credit profile, vehicle, and lender. Rates shown are for comparison purposes.
          </motion.p>
        </div>
      </section>


      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</motion.h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                  {faq.q}
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
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
            <motion.p variants={fadeUp} className="text-gray-500 mb-10">Get pre-approved in minutes with no impact to your credit score.</motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/apply" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200 cursor-pointer">
                Check Your Rate — Free
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 text-xs text-gray-400">No credit impact. No obligation.</motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
