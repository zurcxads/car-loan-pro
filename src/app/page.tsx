"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

const stats = [
  { value: '15,000+', label: 'Pre-Approvals' },
  { value: '$2.1B', label: 'Funded' },
  { value: '4.1%', label: 'Avg Rate' },
  { value: '< 5 min', label: 'to Apply' },
];

const steps = [
  { num: '01', title: 'Apply Once', desc: 'Fill out a single application in under 5 minutes. No dealer visits, no phone calls, no obligation.' },
  { num: '02', title: 'Lenders Compete', desc: 'Your profile is matched to our network of lenders who bid for your loan. More competition means better rates.' },
  { num: '03', title: 'Get Pre-Approved', desc: 'Review multiple offers side-by-side, pick the best one, and walk into the dealership with financing locked in.' },
];

const tiers = [
  { name: 'Prime', range: '700+', rate: '3.49 - 5.99%', color: 'bg-green-500' },
  { name: 'Near-Prime', range: '620 - 699', rate: '5.99 - 8.49%', color: 'bg-blue-500' },
  { name: 'Subprime', range: '520 - 619', rate: '8.99 - 14.99%', color: 'bg-amber-500' },
  { name: 'Specialty', range: 'All scores', rate: '6.99 - 12.99%', color: 'bg-zinc-500' },
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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-zinc-700'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#09090B]/90 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">Car Loan Pro</Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/apply" className="hover:text-zinc-50 transition-colors duration-200">Apply</Link>
            <Link href="/offers" className="hover:text-zinc-50 transition-colors duration-200">Offers</Link>
            <Link href="/status" className="hover:text-zinc-50 transition-colors duration-200">Status</Link>
            <Link href="/lender" className="hover:text-zinc-50 transition-colors duration-200">Lenders</Link>
            <Link href="/dealer" className="hover:text-zinc-50 transition-colors duration-200">Dealers</Link>
            <Link href="/admin" className="hover:text-zinc-50 transition-colors duration-200">Admin</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/apply" className="hidden md:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer">
              Check Your Rate
            </Link>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-zinc-400 cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t border-white/10 bg-[#09090B]/95 backdrop-blur-xl">
              <div className="px-6 py-4 flex flex-col gap-4 text-sm">
                {[['Apply', '/apply'], ['Offers', '/offers'], ['Status', '/status'], ['Lenders', '/lender'], ['Dealers', '/dealer'], ['Admin', '/admin']].map(([label, href]) => (
                  <Link key={label} href={href} className="text-zinc-400 hover:text-zinc-50 py-1 transition-colors duration-200" onClick={() => setMobileMenu(false)}>{label}</Link>
                ))}
                <Link href="/apply" className="mt-2 text-center px-5 py-2.5 bg-blue-600 rounded-lg text-sm font-medium" onClick={() => setMobileMenu(false)}>Check Your Rate</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            No credit impact — check in under 5 minutes
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-glow">
            Stop overpaying<br />at the dealer
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed font-light">
            One application. Multiple lenders competing for your auto loan. Get pre-approved in minutes with no impact to your credit score.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10">
            <Link href="/apply" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-base font-semibold rounded-xl transition-colors duration-200 cursor-pointer">
              Check Your Rate — Free
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-4 text-xs text-zinc-600">No credit impact. No obligation. Results in under 5 minutes.</motion.p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1.5 uppercase tracking-wider font-medium">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold">How It Works</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-zinc-500 text-sm">Three steps to a better auto loan</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="p-7 rounded-2xl surface surface-hover">
                <div className="text-3xl font-bold text-zinc-700 mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lender Tiers */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold">Lenders For Every Credit Profile</motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-zinc-500 text-sm">Our network covers the full credit spectrum</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 gap-4">
            {tiers.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-5 p-5 rounded-2xl surface surface-hover">
                <div className={`w-1.5 h-14 rounded-full ${t.color}`} />
                <div className="flex-1">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">FICO {t.range}</div>
                </div>
                <div className="text-sm text-zinc-300 font-mono tracking-tight">{t.rate}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Rate Comparison */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold mb-12">Dealer vs Car Loan Pro</motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} className="p-8 rounded-2xl surface">
              <div className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-medium">Average Dealer Rate</div>
              <div className="text-5xl font-bold text-red-400">7.9%</div>
              <div className="text-xs text-zinc-600 mt-3">On a $30,000 / 60-month loan</div>
              <div className="text-xl font-semibold mt-4 text-zinc-300">$607/mo</div>
            </motion.div>
            <motion.div variants={fadeUp} className="p-8 rounded-2xl border border-blue-600/30 bg-blue-600/[0.06]">
              <div className="text-xs text-blue-400 mb-3 uppercase tracking-wider font-medium">Car Loan Pro Avg Rate</div>
              <div className="text-5xl font-bold text-blue-400">4.1%</div>
              <div className="text-xs text-zinc-600 mt-3">On a $30,000 / 60-month loan</div>
              <div className="text-xl font-semibold mt-4">$554/mo</div>
              <div className="text-xs text-green-400 mt-2 font-medium">Save $3,180 over the life of the loan</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-center mb-12">What Borrowers Say</motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} className="p-6 rounded-2xl surface">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => <StarIcon key={j} filled={j < t.rating} />)}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.location}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-center mb-12">Frequently Asked Questions</motion.h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-medium hover:bg-zinc-900/50 transition-colors duration-200 cursor-pointer">
                  {faq.q}
                  <svg className={`w-4 h-4 text-zinc-500 transition-transform duration-200 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
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
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold mb-4 text-glow">Ready to save on your auto loan?</motion.h2>
            <motion.p variants={fadeUp} className="text-zinc-400 mb-10">Join 15,000+ borrowers who found better rates through Car Loan Pro.</motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/apply" className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-500 text-base font-semibold rounded-xl transition-colors duration-200 cursor-pointer">
                Check Your Rate — Free
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 text-xs text-zinc-600">No credit impact. No obligation.</motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div>
            <div className="font-semibold mb-4">Product</div>
            <div className="space-y-3 text-zinc-500">
              <Link href="/apply" className="block hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Apply Now</Link>
              <Link href="/offers" className="block hover:text-zinc-50 transition-colors duration-200 cursor-pointer">View Offers</Link>
              <Link href="/status" className="block hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Check Status</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-4">Partners</div>
            <div className="space-y-3 text-zinc-500">
              <Link href="/lender" className="block hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Lender Portal</Link>
              <Link href="/dealer" className="block hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Dealer Portal</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-4">Company</div>
            <div className="space-y-3 text-zinc-500">
              <Link href="/admin" className="block hover:text-zinc-50 transition-colors duration-200 cursor-pointer">Admin</Link>
              <span className="block">About</span>
              <span className="block">Contact</span>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-4">Legal</div>
            <div className="space-y-3 text-zinc-500">
              <span className="block">Privacy Policy</span>
              <span className="block">Terms of Service</span>
              <span className="block">FCRA Disclosure</span>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-10 pt-8 border-t border-white/10 text-xs text-zinc-600 text-center">
          Car Loan Pro is not a lender. Offers are subject to credit approval. NMLS #000000
        </div>
      </footer>
    </div>
  );
}
