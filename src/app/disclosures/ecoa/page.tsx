"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

export default function ECOANoticePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Equal Credit Opportunity Act Notice</h1>
        <p className="text-sm text-gray-500 mb-10">Your Rights Under the ECOA</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Equal Credit Opportunity</h2>
            <p>The federal Equal Credit Opportunity Act (ECOA) prohibits creditors from discriminating against credit applicants on the basis of:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Race</li>
              <li>Color</li>
              <li>Religion</li>
              <li>National origin</li>
              <li>Sex (including gender identity and sexual orientation)</li>
              <li>Marital status</li>
              <li>Age (provided the applicant has the capacity to contract)</li>
              <li>Receipt of income from any public assistance program</li>
              <li>Exercise in good faith of any right under the Consumer Credit Protection Act</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Auto Loan Pro&apos;s Commitment to Equal Opportunity</h2>
            <p>Auto Loan Pro is committed to providing equal access to credit opportunities. We do not discriminate on any of the bases listed above when connecting consumers with lenders in our network. All applicants are evaluated based on their creditworthiness and ability to repay, regardless of protected characteristics.</p>
            <p>The lenders in our network are also required to comply with the ECOA and all applicable fair lending laws. Credit decisions are made based solely on objective financial criteria, including credit history, income, employment, debt-to-income ratio, and other relevant financial factors.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What This Means for You</h2>

            <p><strong>You Cannot Be Denied Credit Based on Protected Characteristics:</strong></p>
            <p>Lenders cannot deny your application, offer you less favorable terms, or discourage you from applying based on your race, color, religion, national origin, sex, marital status, age, or receipt of public assistance.</p>

            <p><strong>You Have the Right to Have Income from Public Assistance Considered:</strong></p>
            <p>If you receive income from public assistance programs such as Social Security, disability benefits, unemployment benefits, or other government assistance, lenders must consider that income the same as income from other sources.</p>

            <p><strong>You Have the Right to Have Alimony and Child Support Considered:</strong></p>
            <p>If you receive regular alimony, child support, or separate maintenance payments, lenders must consider this income if you choose to disclose it. You are not required to disclose this income unless you want it to be considered.</p>

            <p><strong>You Cannot Be Asked Certain Questions:</strong></p>
            <p>Lenders generally cannot ask about your race, color, religion, national origin, or sex for credit evaluation purposes. However, lenders may ask for this information for monitoring purposes to ensure compliance with fair lending laws. Providing this information is voluntary, and it will not be used in credit decisions.</p>

            <p><strong>You Cannot Be Required to Have a Co-Signer Based on Prohibited Factors:</strong></p>
            <p>Lenders cannot require you to have a co-signer based on your marital status, sex, or other prohibited factors. If a co-signer is required, it must be based on objective creditworthiness criteria that apply equally to all applicants.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Right to Know Why Credit Was Denied</h2>
            <p>If a lender denies your credit application, reduces the amount of credit you requested, or offers you credit on terms that are less favorable than those you applied for, the lender must provide you with a written notice that includes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The specific reasons for the adverse action (e.g., insufficient income, too many recent credit inquiries, insufficient credit history)</li>
              <li>A notice of your right to request the reasons for the denial within 60 days</li>
              <li>The name, address, and telephone number of the federal agency that administers compliance with the ECOA for that lender</li>
            </ul>
            <p>The lender must give you this notice even if you did not expressly request credit but were denied (for example, if you were denied after a pre-qualification process).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Monitoring Information (Voluntary)</h2>
            <p>Federal law requires lenders to request certain demographic information for monitoring purposes to ensure compliance with fair lending laws. This information may include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ethnicity</li>
              <li>Race</li>
              <li>Sex</li>
            </ul>
            <p>Providing this information is <strong>voluntary</strong>. If you choose not to provide this information, the lender may note your ethnicity, race, and sex based on visual observation or surname. This information will <strong>not</strong> be used in the credit decision and will not affect your application in any way. It is collected solely for the purpose of monitoring compliance with federal fair lending laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">How to File a Complaint</h2>
            <p>If you believe you have been discriminated against in violation of the Equal Credit Opportunity Act, you have the right to file a complaint.</p>

            <p><strong>Consumer Financial Protection Bureau (CFPB):</strong></p>
            <p>The CFPB enforces the ECOA and accepts complaints regarding discrimination in lending:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Online: <a href="https://www.consumerfinance.gov/complaint/" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.consumerfinance.gov/complaint</a></li>
              <li>Phone: 1-855-411-CFPB (2372)</li>
              <li>TTY/TDD: 1-855-729-2372</li>
              <li>Mail: Consumer Financial Protection Bureau, P.O. Box 4503, Iowa City, IA 52244</li>
            </ul>

            <p><strong>Federal Trade Commission (FTC):</strong></p>
            <p>You can also file a complaint with the FTC:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Online: <a href="https://www.ftccomplaintassistant.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.ftccomplaintassistant.gov</a></li>
              <li>Phone: 1-877-FTC-HELP (1-877-382-4357)</li>
              <li>TTY: 1-866-653-4261</li>
            </ul>

            <p><strong>U.S. Department of Justice:</strong></p>
            <p>If you believe a pattern or practice of discrimination exists, you can file a complaint with the Department of Justice:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Online: <a href="https://civilrights.justice.gov/" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">civilrights.justice.gov</a></li>
              <li>Phone: 1-855-856-1247 (Civil Rights Division)</li>
              <li>Mail: U.S. Department of Justice, Civil Rights Division, 950 Pennsylvania Avenue NW, Washington, DC 20530</li>
            </ul>

            <p><strong>State Attorney General:</strong></p>
            <p>You may also file a complaint with your state Attorney General&apos;s office. Many states have their own fair lending laws and enforcement agencies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Right to Sue</h2>
            <p>In addition to filing a complaint with a government agency, you have the right to bring a lawsuit in federal court if you believe you have been discriminated against in violation of the ECOA. If you win your case, you may be entitled to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Actual damages (financial losses you suffered)</li>
              <li>Punitive damages (up to $10,000 in individual actions)</li>
              <li>Equitable relief (such as requiring the lender to extend credit to you)</li>
              <li>Attorney&apos;s fees and court costs</li>
            </ul>
            <p>You should consult with an attorney if you believe you have been the victim of credit discrimination.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Protections</h2>

            <p><strong>Marital Status:</strong></p>
            <p>Lenders cannot discriminate against you because you are married, single, separated, divorced, or widowed. They cannot ask about your marital status unless you live in a community property state or are relying on property located in such a state as a basis for repayment.</p>

            <p><strong>Age:</strong></p>
            <p>Lenders cannot discriminate against you because of your age, as long as you are old enough to enter into a binding contract (typically 18 years or older). In fact, lenders must consider income from pensions, annuities, and retirement benefits the same as income from other sources.</p>

            <p><strong>Public Assistance:</strong></p>
            <p>Lenders cannot discriminate against you because you receive income from public assistance programs such as Temporary Assistance for Needy Families (TANF), Supplemental Security Income (SSI), or food stamps.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Notice to Married Applicants</h2>
            <p>If you are applying for individual credit (credit in your name only), a lender cannot require your spouse to co-sign unless:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your spouse will be allowed to use the account</li>
              <li>You live in a community property state (Arizona, California, Idaho, Louisiana, Nevada, New Mexico, Texas, Washington, or Wisconsin)</li>
              <li>You are relying on your spouse&apos;s income or on property you own jointly with your spouse to repay the credit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Resources</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>CFPB ECOA Guide: <a href="https://www.consumerfinance.gov/about-us/newsroom/federal-trade-commission-consumer-financial-protection-bureau-publish-final-rule-to-ensure-equal-access-to-credit/" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">CFPB ECOA Resources</a></li>
              <li>FTC Fair Lending: <a href="https://www.consumer.ftc.gov/articles/0347-your-equal-credit-opportunity-rights" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">FTC ECOA Guide</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Auto Loan Pro</h2>
            <p>If you have questions about Auto Loan Pro&apos;s commitment to equal credit opportunity or wish to report a concern, please contact us at:</p>
            <p>
              <strong>Auto Loan Pro LLC</strong><br />
              Email: <a href="mailto:legal@autoloanpro.co" className="text-blue-600 hover:text-blue-500">legal@autoloanpro.co</a><br />
              Address: Austin, Texas
            </p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <Link href="/disclosures" className="text-sm text-blue-600 hover:text-blue-500">← Back to Disclosures</Link>
        </div>
      </motion.div>

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
