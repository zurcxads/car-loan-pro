"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: March 11, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>Auto Loan Pro (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates autoloanpro.co and related services (the &quot;Platform&quot;). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Platform to connect with auto lending partners.</p>
            <p>We are committed to protecting your privacy and complying with applicable laws, including the Gramm-Leach-Bliley Act (GLBA), the Fair Credit Reporting Act (FCRA), the California Consumer Privacy Act (CCPA), and other state privacy laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p><strong>Personal Information:</strong> Name, date of birth, Social Security Number (SSN), email address, phone number, mailing address, driver&apos;s license number and state.</p>
            <p><strong>Financial Information:</strong> Employment status, income, employer information, monthly housing payment, existing debts, and credit profile information obtained through soft credit inquiries.</p>
            <p><strong>Vehicle Information:</strong> Vehicle year, make, model, VIN, mileage, asking price, and dealer information.</p>
            <p><strong>Technical Information:</strong> IP address, browser type, device information, cookies, and usage analytics collected through standard web technologies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process your loan application and match you with lending partners</li>
              <li>Perform soft credit inquiries to pre-qualify you for loan offers</li>
              <li>Communicate with you about your application status and offers</li>
              <li>Improve our Platform and develop new features</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Prevent fraud and protect the security of our Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Information Sharing</h2>
            <p>We share your information with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Lending Partners:</strong> We share your application data with lenders in our network for the purpose of generating pre-qualification offers. Lenders who receive your data are bound by their own privacy policies and applicable lending regulations.</li>
              <li><strong>Credit Bureaus:</strong> We access credit reports through soft inquiries. If you accept a lender&apos;s offer, the lender may perform a hard credit inquiry.</li>
              <li><strong>Service Providers:</strong> We use third-party vendors for hosting, analytics, customer support, and security — all bound by data protection agreements.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information when required by law, regulation, or legal process.</li>
            </ul>
            <p>We do <strong>not</strong> sell your personal information to third parties for marketing purposes unrelated to your loan application.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Credit Inquiries</h2>
            <p>When you submit an application through Auto Loan Pro, we perform a <strong>soft credit inquiry</strong> (also called a soft pull). This does <strong>not</strong> affect your credit score. A hard credit inquiry only occurs if you explicitly consent and choose to proceed with a specific lender&apos;s offer.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p>We protect your information using:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>256-bit SSL/TLS encryption for all data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Multi-factor authentication for internal systems</li>
              <li>Regular security audits and penetration testing</li>
              <li>SOC 2 Type II compliant infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p>Depending on your state of residence, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale or sharing of personal information</li>
              <li>Receive a copy of your data in a portable format</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:support@autoloanpro.co" className="text-blue-600 hover:text-blue-500">support@autoloanpro.co</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies & Tracking</h2>
            <p>We use cookies and similar technologies for essential functionality, analytics, and to improve your experience. You can manage cookie preferences through your browser settings. We do not use cookies for targeted advertising.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Application data is typically retained for 7 years in accordance with financial regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Children&apos;s Privacy</h2>
            <p>Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect information from children under 18.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on our Platform and updating the &quot;Last updated&quot; date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, contact us at:</p>
            <p>
              Auto Loan Pro<br />
              Email: <a href="mailto:support@autoloanpro.co" className="text-blue-600 hover:text-blue-500">support@autoloanpro.co</a>
            </p>
          </section>
        </div>
      </motion.div>

      <footer className="border-t border-gray-200 py-8 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-6 justify-center text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
          <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          <span>NMLS #000000</span>
        </div>
      </footer>
    </div>
  );
}
