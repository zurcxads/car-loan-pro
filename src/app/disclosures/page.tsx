"use client";

import Link from 'next/link';
import { BarChart3, Scale, Megaphone, Map } from 'lucide-react';

const disclosures = [
  {
    title: 'Fair Credit Reporting Act (FCRA)',
    description: 'Learn about your rights under the FCRA, including credit inquiries, credit reports, and how to dispute errors.',
    href: '/disclosures/fcra',
    Icon: BarChart3,
  },
  {
    title: 'Equal Credit Opportunity Act (ECOA)',
    description: 'Understand your rights to equal credit opportunity and protection against discrimination in lending.',
    href: '/disclosures/ecoa',
    Icon: Scale,
  },
  {
    title: 'Advertising Disclosures',
    description: 'Important information about APR ranges, rate estimates, and loan terms advertised on our platform.',
    href: '/disclosures/advertising',
    Icon: Megaphone,
  },
  {
    title: 'State-Specific Disclosures',
    description: 'Disclosures and notices for residents of specific states, including licensing and regulatory information.',
    href: '/disclosures/state',
    Icon: Map,
  },
];

const legalLinks = [
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    href: '/privacy',
  },
  {
    title: 'Terms of Service',
    description: 'The legal agreement governing your use of Auto Loan Pro.',
    href: '/terms',
  },
];

export default function DisclosuresHubPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <div className="animate-fadeIn max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Disclosures & Legal Information</h1>
        <p className="text-base text-gray-600 mb-12 max-w-2xl">
          Auto Loan Pro is committed to transparency and compliance with federal and state consumer protection laws.
          Review the disclosures below to understand your rights and how we operate.
        </p>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Consumer Rights & Disclosures</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {disclosures.map((item, i) => (
              <div key={item.href} style={{ animationDelay: `${i * 0.08}s` }} className="animate-fadeIn opacity-0">
                <Link href={item.href} className="block p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <item.Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                      <div className="mt-4 text-sm text-blue-600 font-medium">Read More →</div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Legal Documents</h2>
          <div className="space-y-4">
            {legalLinks.map((item, i) => (
              <div key={item.href} style={{ animationDelay: `${0.12 + i * 0.08}s` }} className="animate-fadeIn opacity-0">
                <Link href={item.href} className="block p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-blue-600 text-xl">→</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What Is Auto Loan Pro?</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Auto Loan Pro is an <strong>auto loan marketplace</strong> that connects consumers with licensed lenders.
            We are <strong>not a lender</strong>, loan broker, or loan servicer. We do not:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 ml-5 list-disc">
            <li>Originate, fund, or service auto loans</li>
            <li>Make credit decisions or approve loan applications</li>
            <li>Set interest rates, terms, or loan conditions</li>
            <li>Collect loan payments or manage loan accounts</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed mt-4">
            All loan products, credit decisions, and terms are determined solely by the participating lenders in our network.
            Auto Loan Pro earns referral fees from lenders when a loan is successfully funded.
          </p>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Questions or Concerns?</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            If you have questions about any of our disclosures, your consumer rights, or our practices, please contact us:
          </p>
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-2">Auto Loan Pro LLC</p>
            <p>Email: <a href="mailto:legal@autoloanpro.co" className="text-blue-600 hover:text-blue-500">legal@autoloanpro.co</a></p>
            <p>Privacy Inquiries: <a href="mailto:privacy@autoloanpro.co" className="text-blue-600 hover:text-blue-500">privacy@autoloanpro.co</a></p>
            <p>Support: <a href="mailto:support@autoloanpro.co" className="text-blue-600 hover:text-blue-500">support@autoloanpro.co</a></p>
            <p className="mt-2">Austin, Texas</p>
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">← Back to Home</Link>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-8 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-6 justify-center text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
          <Link href="/disclosures" className="hover:text-gray-600">Disclosures</Link>
          <Link href="/contact" className="hover:text-gray-600">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
