"use client";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <div className="animate-fadeIn max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900  mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500  mb-10">Effective Date: March 13, 2026</p>

        <div className="prose prose-sm prose-gray  max-w-none space-y-8 text-gray-600  leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>Auto Loan Pro LLC (&quot;Auto Loan Pro,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates an online auto loan marketplace at autoloanpro.co (the &quot;Platform&quot;). This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our Platform.</p>
            <p>We are committed to protecting your privacy and complying with applicable federal and state privacy and data protection laws, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Gramm-Leach-Bliley Act (GLBA)</li>
              <li>Fair Credit Reporting Act (FCRA)</li>
              <li>Equal Credit Opportunity Act (ECOA)</li>
              <li>California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA)</li>
              <li>Other applicable state privacy laws</li>
            </ul>
            <p>By using the Platform, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>

            <p><strong>Personal Identification Information:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Full name, including middle name and suffix</li>
              <li>Date of birth</li>
              <li>Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN)</li>
              <li>Driver&apos;s license number and issuing state</li>
              <li>Email address</li>
              <li>Phone number (mobile and home)</li>
              <li>Current and previous residential addresses</li>
            </ul>

            <p><strong>Financial Information:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Employment status and employer information (name, address, phone)</li>
              <li>Job title and length of employment</li>
              <li>Gross monthly income and other income sources</li>
              <li>Monthly housing payment and residence type (own, rent, other)</li>
              <li>Existing debts and financial obligations</li>
              <li>Credit profile information obtained through soft credit inquiries</li>
            </ul>

            <p><strong>Vehicle Information:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Vehicle year, make, model, trim, and condition</li>
              <li>Vehicle Identification Number (VIN)</li>
              <li>Mileage</li>
              <li>Asking price or purchase price</li>
              <li>Dealer information or private party seller details</li>
              <li>Trade-in vehicle information, if applicable</li>
            </ul>

            <p><strong>Technical and Usage Information:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>IP address and geolocation data</li>
              <li>Browser type, version, and language settings</li>
              <li>Device type, operating system, and unique device identifiers</li>
              <li>Cookies, web beacons, and similar tracking technologies</li>
              <li>Pages visited, time spent on pages, and navigation paths</li>
              <li>Referral source (how you arrived at our Platform)</li>
            </ul>

            <p><strong>Communications:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Email correspondence, chat messages, and customer support inquiries</li>
              <li>Feedback, reviews, and survey responses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>

            <p><strong>Loan Application Processing:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To process your auto loan application and match you with suitable lenders in our network</li>
              <li>To perform soft credit inquiries to pre-qualify you for loan offers</li>
              <li>To share your application data with participating lenders for underwriting and approval</li>
            </ul>

            <p><strong>Communications:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To communicate with you about your application status, offers, and account</li>
              <li>To respond to your inquiries, requests, and customer support needs</li>
              <li>To send you updates, notifications, and service-related announcements</li>
            </ul>

            <p><strong>Platform Improvement:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To improve our Platform, develop new features, and enhance user experience</li>
              <li>To conduct analytics, research, and market analysis</li>
              <li>To personalize your experience and tailor offers to your profile</li>
            </ul>

            <p><strong>Security and Fraud Prevention:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To prevent fraud, identity theft, and other illegal activities</li>
              <li>To protect the security and integrity of our Platform and systems</li>
              <li>To verify your identity and authenticate applications</li>
            </ul>

            <p><strong>Legal Compliance:</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To comply with applicable laws, regulations, and legal processes</li>
              <li>To enforce our Terms of Service and other agreements</li>
              <li>To respond to lawful requests from government authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. How We Share Your Information</h2>

            <p><strong>With Participating Lenders:</strong></p>
            <p>When you submit an application, you expressly consent to us sharing your application data with lenders in our network for the purpose of generating pre-qualification offers and loan approvals. Lenders who receive your data are bound by their own privacy policies and applicable lending regulations, including the FCRA, ECOA, and GLBA. We typically share your data with up to 8 lenders based on your credit profile and loan requirements.</p>

            <p><strong>With Credit Bureaus:</strong></p>
            <p>We obtain your credit report from one or more consumer reporting agencies (credit bureaus) through a soft inquiry. If you accept a lender&apos;s offer, that lender may perform a hard credit inquiry directly with the credit bureaus.</p>

            <p><strong>With Service Providers:</strong></p>
            <p>We share your information with third-party service providers who perform services on our behalf, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cloud hosting and infrastructure providers</li>
              <li>Customer support and communication platforms</li>
              <li>Analytics and data processing services</li>
              <li>Security and fraud prevention services</li>
              <li>Identity verification and authentication services</li>
            </ul>
            <p>All service providers are bound by contractual obligations to protect your data and use it only for the purposes we specify.</p>

            <p><strong>For Legal Reasons:</strong></p>
            <p>We may disclose your information when required by law, regulation, or legal process, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>In response to subpoenas, court orders, or other legal requests</li>
              <li>To comply with regulatory reporting requirements</li>
              <li>To protect our rights, property, or safety, or that of others</li>
              <li>In connection with legal investigations or proceedings</li>
            </ul>

            <p><strong>Business Transfers:</strong></p>
            <p>If Auto Loan Pro is involved in a merger, acquisition, sale of assets, or bankruptcy, your personal information may be transferred as part of that transaction. You will be notified of any such change in ownership or control of your personal information.</p>

            <p><strong>What We Do NOT Do:</strong></p>
            <p>We do <strong>not</strong> sell your personal information to third parties for marketing purposes unrelated to your loan application. We do not share your information with unrelated third parties for their own direct marketing without your consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Credit Inquiries and FCRA Disclosures</h2>

            <p><strong>Soft Credit Inquiries:</strong></p>
            <p>When you submit an application through Auto Loan Pro, we perform a <strong>soft credit inquiry</strong> (also called a soft pull or soft credit check) to assess your creditworthiness and match you with suitable lenders. A soft credit inquiry:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Does <strong>not</strong> affect your credit score</li>
              <li>Is visible only to you on your credit report</li>
              <li>Is not visible to other lenders or creditors</li>
              <li>Allows us to provide you with pre-qualification offers without credit score impact</li>
            </ul>

            <p><strong>Hard Credit Inquiries:</strong></p>
            <p>If you choose to accept a lender&apos;s offer and proceed with that lender, the lender may perform a <strong>hard credit inquiry</strong> (also called a hard pull or hard credit check). A hard credit inquiry:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>May</strong> temporarily lower your credit score by a few points</li>
              <li>Is visible to other lenders and creditors on your credit report</li>
              <li>Remains on your credit report for up to 2 years</li>
              <li>Is performed by the lender, not by Auto Loan Pro</li>
            </ul>
            <p>You authorize any lender whose offer you accept to obtain your credit report through a hard credit inquiry.</p>

            <p><strong>Your FCRA Rights:</strong></p>
            <p>Under the Fair Credit Reporting Act, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Obtain a free copy of your credit report once every 12 months from each of the three major credit bureaus</li>
              <li>Dispute inaccurate or incomplete information on your credit report</li>
              <li>Request that a consumer reporting agency correct or delete inaccurate, incomplete, or unverifiable information</li>
              <li>Limit prescreened offers of credit and insurance</li>
              <li>Seek damages from violators</li>
            </ul>
            <p>For more information about your FCRA rights, visit our <Link href="/disclosures/fcra" className="text-blue-600 hover:text-blue-500">FCRA Disclosures page</Link> or the Federal Trade Commission website at <a href="https://www.ftc.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">ftc.gov</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. Our security measures include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Encryption:</strong> 256-bit SSL/TLS encryption for all data in transit between your browser and our servers</li>
              <li><strong>Data at Rest Encryption:</strong> AES-256 encryption for sensitive data stored in our databases</li>
              <li><strong>Access Controls:</strong> Multi-factor authentication (MFA) for internal systems and role-based access controls</li>
              <li><strong>Security Audits:</strong> Regular security audits, vulnerability assessments, and penetration testing</li>
              <li><strong>Compliance:</strong> SOC 2 Type II compliant infrastructure and adherence to GLBA Safeguards Rule</li>
              <li><strong>Employee Training:</strong> Security awareness training for all employees with access to personal information</li>
            </ul>
            <p>Despite these measures, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we are committed to protecting your information using best practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
            <p>Specific retention periods include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Application Data:</strong> Typically retained for 7 years in accordance with financial record-keeping regulations and potential statute of limitations periods</li>
              <li><strong>Account Data:</strong> Retained while your account is active and for a reasonable period thereafter</li>
              <li><strong>Technical Data:</strong> Cookies and analytics data typically retained for 12-24 months</li>
              <li><strong>Communications:</strong> Customer support inquiries and correspondence retained for up to 5 years</li>
            </ul>
            <p>After the retention period, we securely delete or anonymize your personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Your Privacy Rights</h2>

            <p>Depending on your state of residence, you may have the following rights regarding your personal information:</p>

            <p><strong>Right to Access:</strong> You have the right to request access to the personal information we hold about you, including the categories of information, sources, purposes of use, and third parties with whom it has been shared.</p>

            <p><strong>Right to Correction:</strong> You have the right to request correction of inaccurate or incomplete personal information.</p>

            <p><strong>Right to Deletion:</strong> You have the right to request deletion of your personal information, subject to certain exceptions (e.g., legal obligations, fraud prevention, completing transactions).</p>

            <p><strong>Right to Opt-Out:</strong> You have the right to opt out of the sale or sharing of your personal information. Note that we do not sell personal information for monetary consideration, but sharing data with lenders may be considered a &quot;sale&quot; under some state laws. You can opt out by not submitting an application.</p>

            <p><strong>Right to Data Portability:</strong> You have the right to receive a copy of your personal information in a portable, machine-readable format.</p>

            <p><strong>Right to Non-Discrimination:</strong> You have the right not to be discriminated against for exercising your privacy rights.</p>

            <p>To exercise any of these rights, please contact us at <a href="mailto:privacy@autoloanpro.co" className="text-blue-600 hover:text-blue-500">privacy@autoloanpro.co</a>. We will respond to your request within the timeframes required by applicable law (typically 30-45 days).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. California Residents (CCPA/CPRA Rights)</h2>

            <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</p>

            <p><strong>Categories of Personal Information Collected:</strong></p>
            <p>We collect the categories of personal information described in Section 2 of this Privacy Policy, including identifiers, financial information, commercial information, internet activity, and inferences.</p>

            <p><strong>Purposes of Use:</strong></p>
            <p>We use your personal information for the purposes described in Section 3 of this Privacy Policy.</p>

            <p><strong>Categories of Third Parties:</strong></p>
            <p>We share your personal information with the categories of third parties described in Section 4 of this Privacy Policy, including lenders, credit bureaus, and service providers.</p>

            <p><strong>Sale of Personal Information:</strong></p>
            <p>We do not sell personal information for monetary consideration. However, sharing your application data with lenders may be considered a &quot;sale&quot; under the CCPA. You can opt out of this sharing by not submitting an application or by contacting us at <a href="mailto:privacy@autoloanpro.co" className="text-blue-600 hover:text-blue-500">privacy@autoloanpro.co</a>.</p>

            <p><strong>Sensitive Personal Information:</strong></p>
            <p>We collect sensitive personal information, including SSN, driver&apos;s license number, financial account information, and credit information. We use this information only for the purposes disclosed in this Privacy Policy and as permitted by law.</p>

            <p><strong>Right to Limit Use of Sensitive Personal Information:</strong></p>
            <p>California residents have the right to limit the use of sensitive personal information to certain purposes. However, we use sensitive personal information only for purposes necessary to provide our services, and limiting such use would prevent us from processing your loan application.</p>

            <p><strong>Authorized Agent:</strong></p>
            <p>You may designate an authorized agent to make requests on your behalf. The agent must provide proof of authorization, and we may require you to verify your identity directly with us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Texas Residents</h2>
            <p>If you are a Texas resident, you have rights under Texas state law, including the right to request access to and correction of your personal information. Texas law also requires certain disclosures about how we collect, use, and share your information, which are provided throughout this Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Cookies and Tracking Technologies</h2>

            <p>We use cookies, web beacons, pixels, and similar tracking technologies to enhance your experience, analyze usage, and improve our Platform. Types of cookies we use include:</p>

            <p><strong>Essential Cookies:</strong> Required for the Platform to function properly, including session management and security features. These cannot be disabled.</p>

            <p><strong>Analytics Cookies:</strong> Used to understand how visitors use the Platform, including page views, session duration, and navigation patterns. We use tools like Google Analytics and Mixpanel.</p>

            <p><strong>Performance Cookies:</strong> Used to improve Platform performance and user experience by tracking loading times and errors.</p>

            <p><strong>Functional Cookies:</strong> Used to remember your preferences and settings, such as language preferences.</p>

            <p>We do <strong>not</strong> use cookies for targeted advertising or third-party behavioral tracking.</p>

            <p><strong>Cookie Management:</strong></p>
            <p>You can manage cookie preferences through your browser settings. Note that disabling cookies may affect Platform functionality. Most browsers allow you to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>View and delete cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies (this may impact functionality)</li>
              <li>Receive warnings before cookies are set</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Third-Party Links</h2>
            <p>The Platform may contain links to third-party websites, services, or resources, including lender websites and financial institutions. We are not responsible for the privacy practices, content, or policies of any third-party websites. Your use of third-party websites is subject to their privacy policies and terms of service. We encourage you to review the privacy policies of any third-party websites you visit.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Children&apos;s Privacy</h2>
            <p>Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete that information promptly. If you believe we have collected information from a child under 18, please contact us at <a href="mailto:privacy@autoloanpro.co" className="text-blue-600 hover:text-blue-500">privacy@autoloanpro.co</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or business operations. Material changes will be posted on the Platform with an updated effective date. We may also notify you via email or through a prominent notice on the Platform.</p>
            <p>Your continued use of the Platform after any changes to this Privacy Policy constitutes your acceptance of the modified Privacy Policy. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:</p>
            <p>
              <strong>Auto Loan Pro LLC</strong><br />
              Privacy Officer<br />
              Email: <a href="mailto:privacy@autoloanpro.co" className="text-blue-600 hover:text-blue-500">privacy@autoloanpro.co</a><br />
              Address: Austin, Texas
            </p>
            <p>For privacy rights requests (access, deletion, correction), please include your full name, email address, and a description of your request. We will respond within the timeframes required by applicable law.</p>
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
