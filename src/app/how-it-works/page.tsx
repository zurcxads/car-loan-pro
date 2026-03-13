"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Lock, CheckCircle, Building, Zap } from 'lucide-react';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

const steps = [
  {
    num: '01',
    title: 'Apply Once',
    desc: 'Fill out a single application in under 5 minutes. We only need basic info — no dealer visits, no phone calls, no obligation. Your data is encrypted end-to-end.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    details: [
      'Takes less than 5 minutes',
      'Basic personal & vehicle info',
      'No documents required upfront',
      'Save and continue later',
    ],
  },
  {
    num: '02',
    title: 'Lenders Compete',
    desc: 'Your profile is matched to our network of lenders who compete for your business. More competition means better rates for you — not the dealer.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    details: [
      'Up to 8 lenders review your profile',
      'Soft pull only — no credit impact',
      'Lenders bid for your business',
      'Results in as fast as 2 minutes',
    ],
  },
  {
    num: '03',
    title: 'Get Pre-Approved',
    desc: 'Review multiple offers side-by-side, compare APRs, terms, and monthly payments. Pick the best deal and walk into the dealership with financing locked in.',
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
    details: [
      'Compare offers side-by-side',
      'See APR, term, and monthly payment',
      'Download your pre-approval letter',
      'Walk into the dealer with leverage',
    ],
  },
];

const trustBadges = [
  { Icon: Lock, title: '256-bit Encryption', desc: 'Bank-level security protects your data' },
  { Icon: CheckCircle, title: 'Soft Pull Only', desc: 'No impact to your credit score' },
  { Icon: Building, title: 'FDIC Insured Lenders', desc: 'All partners are regulated institutions' },
  { Icon: Zap, title: 'Results in Minutes', desc: 'Most applicants get offers in under 5 min' },
];

export default function HowItWorksPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link href="/how-it-works" className="text-gray-900 font-medium">How It Works</Link>
            <Link href="/calculator" className="hover:text-gray-900 transition-colors duration-200">Calculator</Link>
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
            <Link href="/how-it-works" className="text-gray-900 font-medium" onClick={() => setMobileMenu(false)}>How It Works</Link>
            <Link href="/calculator" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Calculator</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Resources</Link>
            <Link href="/login" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Sign In</Link>
            <Link href="/apply" className="mt-2 text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white" onClick={() => setMobileMenu(false)}>Apply Now</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium mb-8">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            No impact to your credit score
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            How Auto Loan Pro Works
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed font-light">
            Three simple steps to a better auto loan. No dealer markups, no surprises, no hard credit pulls until you choose an offer.
          </motion.p>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-8">
            {steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-8 sm:p-10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{step.num}</span>
                        <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-500 leading-relaxed mb-6">{step.desc}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {step.details.map((detail, j) => (
                          <div key={j} className="flex items-center gap-2.5 text-sm text-gray-600">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex justify-center -mb-4 relative z-10">
                    <div className="w-0.5 h-8 bg-gray-200" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* No Credit Impact Callout */}
      <section className="py-16 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-white border border-blue-200 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Impact to Your Credit Score</h2>
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
              We use a <strong>soft credit inquiry</strong> to match you with lenders. This does not affect your credit score.
              A hard inquiry only happens if you choose to move forward with a specific lender&apos;s offer.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center p-6 rounded-2xl border border-gray-200 bg-gray-50">
                <div className="flex justify-center mb-3">
                  <badge.Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{badge.title}</h3>
                <p className="text-xs text-gray-500">{badge.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-2xl mx-auto text-center">
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to find your best rate?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 mb-10">It takes less than 5 minutes and won&apos;t affect your credit score.</motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/apply" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200">
              Check Your Rate — Free
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-4 text-xs text-gray-400">No credit impact. No obligation. Results in under 5 minutes.</motion.p>
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
