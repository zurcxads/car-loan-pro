"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: March 11, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Auto Loan Pro (&quot;the Platform&quot;), operated by Auto Loan Pro LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>Auto Loan Pro is an online auto lending marketplace that connects consumers (&quot;borrowers&quot;) with a network of third-party lending institutions (&quot;lenders&quot;). We are <strong>not a lender</strong>, bank, or financial institution. We do not make credit decisions, set interest rates, or fund loans.</p>
            <p>Our service facilitates the connection between borrowers and lenders by transmitting loan application data to lenders in our network who may offer pre-qualification terms based on the information provided.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Eligibility</h2>
            <p>To use the Platform, you must:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Be a legal resident of the United States</li>
              <li>Have a valid Social Security Number</li>
              <li>Provide accurate and truthful information in your application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Application Process</h2>
            <p><strong>Information Accuracy:</strong> You agree that all information provided in your application is accurate, complete, and truthful. Providing false or misleading information may result in application denial and potential legal consequences.</p>
            <p><strong>Credit Inquiries:</strong> By submitting an application, you authorize Auto Loan Pro and its lending partners to obtain your credit report through a soft inquiry. This soft inquiry will not impact your credit score. If you choose to accept an offer from a lender, you authorize that lender to perform a hard credit inquiry.</p>
            <p><strong>No Guarantee:</strong> Submitting an application does not guarantee approval or specific loan terms. All offers are subject to lender underwriting and verification.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Pre-Qualification Offers</h2>
            <p>Pre-qualification offers displayed on the Platform are preliminary and based on the information you provided and a soft credit inquiry. These offers:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Are not binding commitments from lenders</li>
              <li>May change based on additional verification or hard credit inquiry results</li>
              <li>Have expiration dates as specified in each offer</li>
              <li>Are subject to the lender&apos;s final underwriting process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Fees</h2>
            <p>Auto Loan Pro does not charge consumers any fees for using the Platform. Our service is free for borrowers. We receive compensation from lending partners when a loan is successfully funded.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for losses arising from unauthorized access to your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Submit false or fraudulent applications</li>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the Platform</li>
              <li>Scrape, mine, or extract data from the Platform without authorization</li>
              <li>Use the Platform on behalf of another person without their explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
            <p>All content, features, and functionality of the Platform — including text, graphics, logos, and software — are owned by Auto Loan Pro and protected by copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Disclaimer of Warranties</h2>
            <p>The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or secure. We do not guarantee specific loan terms, approval, or outcomes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Auto Loan Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform, including but not limited to loan terms offered by lenders, denial of applications, or any actions taken by lending partners.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Third-Party Links & Services</h2>
            <p>The Platform may contain links to third-party websites or services. We are not responsible for the content, policies, or practices of any third-party sites. Your use of third-party services is at your own risk and subject to their terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Modifications</h2>
            <p>We reserve the right to modify these Terms of Service at any time. Material changes will be posted on the Platform with an updated effective date. Your continued use of the Platform after changes constitutes acceptance of the modified terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Dispute Resolution</h2>
            <p>Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in the State of Texas.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">16. Contact</h2>
            <p>For questions about these Terms of Service, contact us at:</p>
            <p>
              Auto Loan Pro LLC<br />
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
