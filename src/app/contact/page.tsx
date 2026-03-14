"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Footer from '@/components/shared/Footer';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

const faqs = [
  {
    question: "How quickly can I get pre-approved?",
    answer: "Most applicants receive pre-approval offers within 2 minutes of submitting their application. Our platform instantly matches your profile with multiple lenders in real-time."
  },
  {
    question: "Will this affect my credit score?",
    answer: "No. Auto Loan Pro uses a soft credit pull for the initial pre-qualification, which does not impact your credit score. Your credit is only affected if you choose to accept a specific offer and proceed with that lender."
  },
  {
    question: "Do I need to choose a vehicle first?",
    answer: "No. You can get pre-approved for a loan amount before you find a car. This gives you negotiating power when you shop, knowing exactly how much you can spend."
  },
  {
    question: "How many lenders will see my application?",
    answer: "Your application is sent to our network of lenders who specialize in your credit tier and loan requirements. Typically 5-10 lenders will review your profile and make offers."
  },
  {
    question: "Is Auto Loan Pro really free?",
    answer: "Yes, 100% free for consumers. We earn referral fees from lenders when loans are successfully funded, so our incentive is to find you the best deal possible."
  },
  {
    question: "What if I have bad credit?",
    answer: "We work with lenders across the full credit spectrum, from prime to subprime. Even if you have less-than-perfect credit, you may still receive multiple offers."
  },
  {
    question: "Can I use this for a used car?",
    answer: "Absolutely. Our lenders finance both new and used vehicles from dealerships and private sellers."
  },
  {
    question: "How long is my pre-approval valid?",
    answer: "Pre-approval offers are typically valid for 30-45 days, giving you plenty of time to shop for the right vehicle."
  },
  {
    question: "What documents will I need?",
    answer: "For pre-approval, we only need basic information. If you accept an offer, the lender may request proof of income, employment verification, and identification."
  },
  {
    question: "Can I cancel or change my application?",
    answer: "Yes. You can withdraw or update your application at any time before accepting a specific offer. There is no obligation."
  }
];

type ContactSubmissionPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ContactApiResponse =
  | { success: true; data?: { message?: string } }
  | { success: false; error?: string };

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    const payload: ContactSubmissionPayload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: ContactApiResponse = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = 'error' in result ? result.error : undefined;
        throw new Error(errorMessage || 'Failed to send your message.');
      }

      setSubmitMessage(result.data?.message || 'Your message has been sent successfully.');
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('General');
      setMessage('');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to send your message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="min-h-screen bg-white dark:bg-zinc-950">
      <section className="pt-28 pb-16 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl mx-auto">
          <div className="sr-only" aria-live="polite">
            {submitted ? 'Message sent successfully.' : submitting ? 'Sending your message.' : 'Contact form ready.'}
          </div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 text-center">Contact Us</motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-gray-600 dark:text-zinc-300 text-center font-light">
            Have a question? We&apos;re here to help.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-12 grid sm:grid-cols-3 gap-6 mb-12">
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Email</h3>
              <a href="mailto:hello@autoloanpro.co" className="text-sm text-blue-600 hover:text-blue-500 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">hello@autoloanpro.co</a>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Business Hours</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-300">Mon-Fri: 9am-6pm ET</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Weekend: Closed</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 p-6 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">FAQ</h3>
              <a href="#faq" className="text-sm text-blue-600 hover:text-blue-500 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm">View Common Questions</a>
            </div>
          </motion.div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-blue-200 dark:border-zinc-800 bg-blue-50 dark:bg-zinc-900/50 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
                <Check className="h-7 w-7 text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">Message Sent</h2>
              <p className="text-sm text-gray-600 dark:text-zinc-300">{submitMessage}</p>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm p-8 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">Send us a message</h2>
              <div>
                <label htmlFor="contact-name" className="block text-xs text-gray-600 dark:text-zinc-300 mb-2 font-medium">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs text-gray-600 dark:text-zinc-300 mb-2 font-medium">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-subject" className="block text-xs text-gray-600 dark:text-zinc-300 mb-2 font-medium">Subject</label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200 cursor-pointer"
                >
                  <option>General</option>
                  <option>Support</option>
                  <option>Lender Partnership</option>
                  <option>Dealer Partnership</option>
                  <option>Press</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs text-gray-600 dark:text-zinc-300 mb-2 font-medium">Message</label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors duration-200 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" aria-live="assertive">
                  {submitError}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </motion.form>
          )}
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-6 bg-gray-50 dark:bg-zinc-900/50">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100 text-center mb-12">
            Frequently Asked Questions
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} className="rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  aria-expanded={expandedFaq === i}
                  aria-controls={`contact-faq-panel-${i}`}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                >
                  <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100 pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expandedFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <motion.div
                    id={`contact-faq-panel-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-1">
                      <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Partnership Sections */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* For Lenders */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-3">For Lenders</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed mb-6">
              Join our lender network and access high-quality, pre-screened auto loan applicants. We handle lead generation, underwriting support, and compliance — you focus on funding great deals.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                Pre-qualified, high-intent applicants
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                API integration for seamless decisioning
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                Flexible underwriting criteria
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                Real-time application delivery
              </li>
            </ul>
            <a href="mailto:lenders@autoloanpro.co" className="inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 active:scale-[0.98] transition-transform">
              Partner with Us
            </a>
          </motion.div>

          {/* For Dealers */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-3">For Dealers</h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed mb-6">
              Receive pre-approved shoppers ready to buy. Our customers come to your lot with financing already secured, reducing time on the lot and closing more deals faster.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                Pre-approved, ready-to-buy customers
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                Faster deal closures
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                No cost to list or participate
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300" />
                Lead management dashboard
              </li>
            </ul>
            <a href="mailto:dealers@autoloanpro.co" className="inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 active:scale-[0.98] transition-transform">
              Become a Partner Dealer
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </motion.div>
  );
}
