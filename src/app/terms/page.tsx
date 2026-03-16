"use client";

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav role="navigation" className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <div className="animate-fadeIn max-w-3xl mx-auto px-6 pb-16 pt-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: March 13, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Auto Loan Pro website, mobile application, or related services (collectively, the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Platform.</p>
            <p>These Terms constitute a legally binding agreement between you and Auto Loan Pro LLC (&quot;Auto Loan Pro,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a Texas limited liability company operating an auto loan marketplace.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. What Auto Loan Pro Is</h2>
            <p><strong>Auto Loan Pro is a marketplace, not a lender.</strong> We connect consumers seeking auto financing with third-party lending institutions in our network. We do not:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Originate, fund, or service auto loans</li>
              <li>Make credit decisions or approve loan applications</li>
              <li>Set interest rates, terms, or loan conditions</li>
              <li>Act as a loan broker or intermediary in loan transactions</li>
              <li>Collect loan payments or manage loan accounts</li>
            </ul>
            <p>All loan products, credit decisions, approval processes, interest rates, terms, and conditions are determined solely by the participating lenders in our network. When you submit an application through our Platform, you are applying directly to one or more lenders. If a lender approves your application and you accept their offer, the loan agreement is between you and that lender.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How Auto Loan Pro Earns Revenue</h2>
            <p>Auto Loan Pro earns referral fees from lenders when a loan is successfully funded. We do not charge consumers any fees for using the Platform. Our revenue model means we are incentivized to connect you with competitive loan offers, but it also means we have a financial relationship with the lenders we work with. We do not favor lenders based on referral fee amounts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Eligibility</h2>
            <p>To use the Platform and apply for auto financing, you must:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Be a legal resident of the United States</li>
              <li>Have a valid Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN)</li>
              <li>Provide accurate, current, and complete information in your application</li>
              <li>Have the legal capacity to enter into a binding contract</li>
            </ul>
            <p>By submitting an application, you represent and warrant that you meet these eligibility requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. User Accounts and Access</h2>
            <p>When you submit an application, you may receive session-based access to view your application status and offers. You are responsible for maintaining the confidentiality of any session tokens or access credentials provided to you. You agree to immediately notify us of any unauthorized use of your account or any other security breach. We are not liable for any loss or damage arising from your failure to protect your account credentials.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Application Process and Data Sharing</h2>
            <p><strong>Information You Provide:</strong> When you submit an application through the Platform, you provide us with personal and financial information, including your name, contact information, Social Security Number, date of birth, employment details, income information, and vehicle details.</p>
            <p><strong>Consent to Share Data:</strong> By submitting an application, you expressly consent to Auto Loan Pro sharing your application data with participating lenders in our network for the purpose of obtaining pre-qualification and loan offers. Lenders who receive your data will use it in accordance with their own privacy policies and applicable lending regulations, including the Fair Credit Reporting Act (FCRA) and Equal Credit Opportunity Act (ECOA).</p>
            <p><strong>Credit Inquiries:</strong> When you submit an application, Auto Loan Pro will perform a soft credit inquiry (soft pull) to assess your creditworthiness and match you with suitable lenders. A soft credit inquiry does not affect your credit score. If you choose to accept a lender&apos;s offer and proceed with that lender, the lender may perform a hard credit inquiry (hard pull), which may impact your credit score. You authorize Auto Loan Pro to obtain your credit report through a soft inquiry, and you authorize any lender whose offer you accept to obtain your credit report through a hard inquiry.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Pre-Qualification Offers</h2>
            <p>Pre-qualification offers displayed on the Platform are preliminary estimates based on the information you provided and a soft credit inquiry. These offers:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Are not binding commitments or guarantees from lenders</li>
              <li>Are subject to verification of your information and additional underwriting</li>
              <li>May change based on a hard credit inquiry or additional documentation</li>
              <li>Have expiration dates as specified by each lender</li>
              <li>Are conditional upon lender approval and final underwriting</li>
            </ul>
            <p><strong>No Guarantee of Approval:</strong> Submitting an application does not guarantee that you will receive any offers, that any offers will be approved, or that you will receive specific loan terms. All final credit decisions are made solely by the lenders.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Accuracy of Information</h2>
            <p>You agree that all information you provide in your application is accurate, complete, truthful, and current. Providing false, misleading, or fraudulent information may result in:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Denial of your application</li>
              <li>Revocation of pre-qualification offers</li>
              <li>Termination of your access to the Platform</li>
              <li>Legal consequences, including potential criminal prosecution for fraud</li>
            </ul>
            <p>If any information you provided changes, you agree to update it promptly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Submit false, fraudulent, or misleading applications or information</li>
              <li>Use the Platform for any unlawful purpose or in violation of these Terms</li>
              <li>Attempt to gain unauthorized access to our systems, networks, or databases</li>
              <li>Interfere with or disrupt the proper functioning of the Platform</li>
              <li>Use automated means (bots, scrapers, crawlers) to access the Platform without our prior written consent</li>
              <li>Submit applications on behalf of another person without their explicit written authorization</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from the Platform</li>
              <li>Use the Platform to submit multiple applications with different information to test different scenarios (loan stacking)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Intellectual Property</h2>
            <p>All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, button icons, images, data compilations, and software, are the exclusive property of Auto Loan Pro or its licensors and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            <p>You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for its intended purpose. You may not copy, modify, distribute, sell, or lease any part of the Platform without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Auto Loan Pro and its officers, directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Loss of profits, revenue, or business opportunities</li>
              <li>Loss of data or information</li>
              <li>Loan terms offered or denied by lenders</li>
              <li>Actions or inactions of participating lenders</li>
              <li>Credit score impact from hard credit inquiries performed by lenders</li>
              <li>Damages arising from your inability to use the Platform</li>
            </ul>
            <p>In no event shall Auto Loan Pro&apos;s total liability to you for all damages, losses, and causes of action exceed one hundred dollars ($100).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Disclaimer of Warranties</h2>
            <p>The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
            <p>We do not warrant that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The Platform will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from using the Platform will be accurate or reliable</li>
              <li>Any errors in the Platform will be corrected</li>
              <li>You will receive any specific loan offers, terms, or approval</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Third-Party Links and Services</h2>
            <p>The Platform may contain links to third-party websites, services, or resources, including lender websites. We are not responsible for the content, accuracy, policies, or practices of any third-party websites or services. Your use of third-party websites or services is at your own risk and subject to their terms and conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Dispute Resolution and Arbitration</h2>
            <p><strong>Binding Arbitration:</strong> Except where prohibited by law, any dispute, claim, or controversy arising out of or relating to these Terms or your use of the Platform shall be resolved through binding arbitration administered by the American Arbitration Association (AAA) in accordance with its Consumer Arbitration Rules.</p>
            <p><strong>Arbitration Location:</strong> Arbitration proceedings shall be conducted in the State of Texas, or another mutually agreed location.</p>
            <p><strong>Class Action Waiver:</strong> You agree that any arbitration or legal proceeding shall be conducted on an individual basis and not as a class action, consolidated action, or representative action. You waive your right to participate in a class action lawsuit or class-wide arbitration.</p>
            <p><strong>Exceptions:</strong> Either party may seek injunctive or other equitable relief in a court of competent jurisdiction to prevent actual or threatened infringement, misappropriation, or violation of intellectual property rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law principles. Any legal action or proceeding arising out of or relating to these Terms (except as subject to arbitration) shall be brought exclusively in the state or federal courts located in Texas, and you consent to the personal jurisdiction of such courts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">16. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the Platform at any time, with or without notice, for any reason, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violation of these Terms</li>
              <li>Submission of fraudulent or false information</li>
              <li>Engaging in prohibited activities</li>
              <li>At our sole discretion for business or operational reasons</li>
            </ul>
            <p>Upon termination, your right to use the Platform will immediately cease. Termination does not affect any rights or obligations that arose prior to termination.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">17. Modifications to Terms</h2>
            <p>We reserve the right to modify, update, or replace these Terms at any time at our sole discretion. Material changes will be posted on the Platform with an updated effective date. We may also notify you via email or through a notice on the Platform.</p>
            <p>Your continued use of the Platform after any changes to these Terms constitutes your acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">18. Severability</h2>
            <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">19. Entire Agreement</h2>
            <p>These Terms, together with our Privacy Policy and any other legal notices or agreements published on the Platform, constitute the entire agreement between you and Auto Loan Pro regarding your use of the Platform and supersede all prior agreements and understandings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">20. Contact Information</h2>
            <p>For questions, concerns, or notices regarding these Terms of Service, please contact us at:</p>
            <p>
              <strong>Auto Loan Pro LLC</strong><br />
              Email: <a href="mailto:legal@autoloanpro.co" className="text-blue-600 hover:text-blue-500">legal@autoloanpro.co</a><br />
              Address: Austin, Texas
            </p>
          </section>
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
