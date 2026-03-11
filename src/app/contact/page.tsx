"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI only for now — no backend
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <Link href="/how-it-works" className="hover:text-gray-900 transition-colors duration-200">How It Works</Link>
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
            <Link href="/how-it-works" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>How It Works</Link>
            <Link href="/calculator" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Calculator</Link>
            <Link href="#" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Resources</Link>
            <Link href="/login" className="text-gray-500 hover:text-gray-900" onClick={() => setMobileMenu(false)}>Sign In</Link>
            <Link href="/apply" className="mt-2 text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white" onClick={() => setMobileMenu(false)}>Apply Now</Link>
          </div>
        )}
      </nav>

      <section className="pt-32 pb-24 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto">
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 text-center">Contact Us</motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-500 text-center font-light">
            Have a question? We&apos;re here to help.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-12 grid sm:grid-cols-2 gap-6 mb-12">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Email</h3>
              <a href="mailto:support@autoloanpro.co" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">support@autoloanpro.co</a>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">FAQ</h3>
              <Link href="/#faq" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">View Common Questions</Link>
            </div>
          </motion.div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Message Sent</h2>
              <p className="text-sm text-gray-500">We&apos;ll get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Send us a message</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer">
                Send Message
              </button>
            </motion.form>
          )}
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
