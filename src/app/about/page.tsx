"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Footer from '@/components/shared/Footer';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

const values = [
  {
    title: 'We Are a Marketplace',
    desc: 'Auto Loan Pro connects consumers with lenders. We are not a lender, broker, or loan servicer. We empower you with choice and transparency.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: 'Free for Consumers',
    desc: 'Auto Loan Pro is 100% free for borrowers. We earn referral fees from lenders when loans are funded — meaning our incentive is to find you the best deal.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: 'No Dealer Markup',
    desc: 'Dealers typically mark up rates by 1-3% for profit. By going directly through our lender network, you bypass dealer financing and keep more money in your pocket.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Soft Pull Only',
    desc: 'We use a soft credit inquiry to match you with lenders. Your credit score is never affected until you choose to accept a specific offer and move forward with that lender.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

const lenderNetwork = [
  'Banks and credit unions offering prime and near-prime rates',
  'Specialty lenders for subprime and rebuilding credit',
  'Captive lenders (manufacturer financing) for new vehicles',
  'Online lenders with fast approval and digital-first processes',
];

export default function AboutPage() {
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
            <Link href="/how-it-works" className="hover:text-gray-900 transition-colors duration-200">How It Works</Link>
            <Link href="/calculator" className="hover:text-gray-900 transition-colors duration-200">Calculator</Link>
            <Link href="/resources" className="hover:text-gray-900 transition-colors duration-200">Resources</Link>
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
            <Link href="/calculator" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Calculator</Link>
            <Link href="/resources" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Resources</Link>
            <Link href="/login" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Sign In</Link>
            <Link href="/apply" className="mt-2 text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white" onClick={() => setMobileMenu(false)}>Apply Now</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto text-center">
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
            About Auto Loan Pro
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed font-light">
            We&apos;re an auto loan marketplace that connects consumers with competing lenders — empowering you with transparency, choice, and better rates.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Mission: Transparency in Auto Lending</h2>
            <p className="text-gray-600 leading-relaxed">
              The traditional auto financing process is broken. Dealers often mark up interest rates by 1-3%, earning thousands in profit while borrowers overpay. This lack of transparency costs consumers billions annually.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Auto Loan Pro was built to change that. We believe every borrower deserves access to competitive rates from multiple lenders — without dealer markups, pressure tactics, or hidden fees. Our marketplace lets lenders compete for your business, which drives rates down and puts you in control.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              One application. Multiple offers. Zero dealer markup. That&apos;s the Auto Loan Pro difference.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">How We&apos;re Different</motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} variants={fadeUp} className="p-7 rounded-2xl border border-gray-200 bg-white">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lender Network */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">Our Lender Network</motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            We partner with a curated network of licensed lenders covering the full credit spectrum — from prime to specialty lenders. More options means better rates and higher approval odds.
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="bg-white border border-gray-200 rounded-2xl p-8">
            <ul className="space-y-4">
              {lenderNetwork.map((item, i) => (
                <motion.li key={i} variants={fadeUp} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">The Team</motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-600 leading-relaxed">
              Auto Loan Pro is built by a team of fintech and lending industry veterans committed to making auto financing transparent and accessible. Our platform is backed by years of experience in consumer lending, credit underwriting, and marketplace technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Press/Media */}
      <section className="py-16 px-6 bg-blue-50">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">Press & Media Inquiries</motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-white border border-blue-200 rounded-2xl p-8 text-center">
            <p className="text-gray-600 leading-relaxed mb-4">
              For media inquiries, partnership opportunities, or general questions about Auto Loan Pro, please contact:
            </p>
            <p className="text-gray-900 font-medium">
              <a href="mailto:press@autoloanpro.co" className="text-blue-600 hover:text-blue-500">press@autoloanpro.co</a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Important Disclosure</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Auto Loan Pro is a marketplace, not a lender.</strong> We connect consumers with licensed lenders but do not originate, fund, or service loans. We do not make credit decisions, set interest rates, or approve loan applications. All loan products, terms, rates, and approval decisions are made solely by the participating lenders in our network. Auto Loan Pro earns referral fees from lenders when loans are successfully funded. For more information, see our <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-2xl mx-auto text-center">
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to save on your auto loan?</motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 mb-10">Join thousands of borrowers who found better rates through Auto Loan Pro.</motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/apply" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl transition-colors duration-200">
              Check Your Rate — Free
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
