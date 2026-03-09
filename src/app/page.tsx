"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const stats = [
  { value: '15,000+', label: 'Pre-Approvals' },
  { value: '$2.1B', label: 'Funded' },
  { value: '4.1%', label: 'Avg Rate' },
  { value: '< 5 min', label: 'to Apply' },
];

const steps = [
  { num: '01', title: 'Apply Once', desc: 'Fill out a single application in under 5 minutes. No dealer visits needed.' },
  { num: '02', title: 'Lenders Compete', desc: 'Your application goes to our network of lenders who compete for your business.' },
  { num: '03', title: 'Get Pre-Approved', desc: 'Review multiple offers, pick the best rate, and walk into the dealership with leverage.' },
];

const tiers = [
  { name: 'Prime', range: '700+', rate: '3.49 - 5.99%', color: 'bg-emerald-500' },
  { name: 'Near-Prime', range: '620 - 699', rate: '5.99 - 8.49%', color: 'bg-blue-500' },
  { name: 'Subprime', range: '520 - 619', rate: '8.99 - 14.99%', color: 'bg-amber-500' },
  { name: 'Specialty', range: 'All scores', rate: '6.99 - 12.99%', color: 'bg-purple-500' },
];

const testimonials = [
  { name: 'David M.', location: 'Houston, TX', text: 'Saved $3,200 over the life of my loan compared to what the dealer offered. The process took 4 minutes.', rating: 5 },
  { name: 'Sarah L.', location: 'Phoenix, AZ', text: 'I had a 640 credit score and still got 3 offers. Ended up with a rate 2% lower than my bank quoted.', rating: 5 },
  { name: 'Carlos R.', location: 'Miami, FL', text: 'First-time buyer with no credit history. Car Loan Pro matched me with a lender that specializes in thin-file borrowers.', rating: 4 },
];

const faqs = [
  { q: 'Does checking my rate affect my credit score?', a: 'No. We use a soft credit inquiry to match you with lenders, which does not impact your credit score. A hard inquiry only occurs if you select an offer and proceed with a specific lender.' },
  { q: 'How many lenders will see my application?', a: 'Your application is sent to up to 8 lenders in our network that match your credit profile and loan requirements. You\'ll only see offers from lenders who pre-approve you.' },
  { q: 'Are there any fees?', a: 'Car Loan Pro is completely free for consumers. We earn a referral fee from lenders when a loan is funded, which means our incentives are aligned with getting you the best deal.' },
  { q: 'What credit score do I need?', a: 'We work with lenders across the full credit spectrum, from prime (700+) to specialty lenders that accept all credit types. There is no minimum score to apply.' },
  { q: 'How long does the process take?', a: 'Most applicants receive their first offers within 2 minutes of submitting. The entire process from application to pre-approval takes under 5 minutes.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/apply" className="hover:text-white transition-colors">Apply</Link>
            <Link href="/offers" className="hover:text-white transition-colors">Offers</Link>
            <Link href="/status" className="hover:text-white transition-colors">Status</Link>
            <Link href="/lender" className="hover:text-white transition-colors">Lenders</Link>
            <Link href="/dealer" className="hover:text-white transition-colors">Dealers</Link>
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/apply" className="hidden md:inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors">
              Check Your Rate
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-zinc-400">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t border-white/5">
              <div className="px-4 py-3 flex flex-col gap-3 text-sm">
                {['Apply', 'Offers', 'Status', 'Lenders', 'Dealers', 'Admin'].map(item => (
                  <Link key={item} href={`/${item.toLowerCase() === 'lenders' ? 'lender' : item.toLowerCase() === 'dealers' ? 'dealer' : item.toLowerCase()}`} className="text-zinc-400 hover:text-white py-1" onClick={() => setMobileMenu(false)}>{item}</Link>
                ))}
                <Link href="/apply" className="mt-1 text-center px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium" onClick={() => setMobileMenu(false)}>Check Your Rate</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Stop overpaying<br />at the dealer
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-lg text-zinc-400 max-w-xl mx-auto">
            One application. Multiple lenders competing for your auto loan. Get pre-approved in minutes with no impact to your credit score.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/apply" className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-base font-semibold rounded-xl transition-colors text-center">
              Check Your Rate — Free
            </Link>
          </motion.div>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-3 text-xs text-zinc-500">No credit impact. Results in under 5 minutes.</motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}
                className="p-6 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="text-3xl font-bold text-blue-600 mb-3">{s.num}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lender Tiers */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Lenders For Every Credit Profile</h2>
          <p className="text-zinc-400 text-center mb-10 text-sm">Our network covers the full credit spectrum</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {tiers.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                <div className={`w-2 h-12 rounded-full ${t.color}`} />
                <div className="flex-1">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-500">FICO {t.range}</div>
                </div>
                <div className="text-sm text-zinc-300 font-mono">{t.rate}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rate Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">Dealer vs Car Loan Pro</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/10">
              <div className="text-sm text-zinc-500 mb-2">Average Dealer Rate</div>
              <div className="text-4xl font-bold text-red-400">7.9%</div>
              <div className="text-xs text-zinc-500 mt-2">On a $30,000 / 60-month loan</div>
              <div className="text-lg font-semibold mt-3 text-zinc-300">$607/mo</div>
            </div>
            <div className="p-6 rounded-xl bg-blue-600/10 border border-blue-500/30">
              <div className="text-sm text-blue-400 mb-2">Car Loan Pro Avg Rate</div>
              <div className="text-4xl font-bold text-blue-400">4.1%</div>
              <div className="text-xs text-zinc-500 mt-2">On a $30,000 / 60-month loan</div>
              <div className="text-lg font-semibold mt-3 text-white">$554/mo</div>
              <div className="text-xs text-emerald-400 mt-1">Save $3,180 over the life of the loan</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">What Borrowers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl bg-zinc-900/50 border border-white/5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} className={`w-4 h-4 ${j < t.rating ? 'text-amber-400' : 'text-zinc-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.location}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-zinc-900/50 transition-colors">
                  {faq.q}
                  <svg className={`w-4 h-4 text-zinc-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-600/10 to-transparent">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to save on your auto loan?</h2>
          <p className="text-zinc-400 mb-8">Join 15,000+ borrowers who found better rates through Car Loan Pro.</p>
          <Link href="/apply" className="inline-flex px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-base font-semibold rounded-xl transition-colors">
            Check Your Rate — Free
          </Link>
          <p className="mt-3 text-xs text-zinc-500">No credit impact. No obligation.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-semibold mb-3">Product</div>
            <div className="space-y-2 text-zinc-500">
              <Link href="/apply" className="block hover:text-white transition-colors">Apply Now</Link>
              <Link href="/offers" className="block hover:text-white transition-colors">View Offers</Link>
              <Link href="/status" className="block hover:text-white transition-colors">Check Status</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3">Partners</div>
            <div className="space-y-2 text-zinc-500">
              <Link href="/lender" className="block hover:text-white transition-colors">Lender Portal</Link>
              <Link href="/dealer" className="block hover:text-white transition-colors">Dealer Portal</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3">Company</div>
            <div className="space-y-2 text-zinc-500">
              <Link href="/admin" className="block hover:text-white transition-colors">Admin</Link>
              <span className="block">About</span>
              <span className="block">Contact</span>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3">Legal</div>
            <div className="space-y-2 text-zinc-500">
              <span className="block">Privacy Policy</span>
              <span className="block">Terms of Service</span>
              <span className="block">FCRA Disclosure</span>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/5 text-xs text-zinc-600 text-center">
          Car Loan Pro is not a lender. Offers are subject to credit approval. NMLS #000000
        </div>
      </footer>
    </div>
  );
}
