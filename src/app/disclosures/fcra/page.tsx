"use client";

import Link from 'next/link';

export default function FCRADisclosurePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <div className="animate-fadeIn max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fair Credit Reporting Act Disclosure</h1>
        <p className="text-sm text-gray-500 mb-10">Your Rights Under the FCRA</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What Is the Fair Credit Reporting Act?</h2>
            <p>The Fair Credit Reporting Act (FCRA) is a federal law that regulates how consumer reporting agencies (credit bureaus) collect, use, and share your credit information. The FCRA gives you specific rights regarding your credit reports and how your credit information is used.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">How Auto Loan Pro Uses Credit Information</h2>

            <p><strong>Soft Credit Inquiries (Soft Pulls):</strong></p>
            <p>When you submit a loan application through Auto Loan Pro, we perform a <strong>soft credit inquiry</strong> to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Assess your creditworthiness</li>
              <li>Match you with suitable lenders in our network</li>
              <li>Provide you with pre-qualification offers</li>
            </ul>
            <p>A soft credit inquiry:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Does NOT affect your credit score</strong></li>
              <li>Is visible only to you on your credit report</li>
              <li>Is not visible to other lenders or creditors</li>
              <li>Can be performed without your explicit consent for pre-qualification purposes</li>
            </ul>

            <p><strong>Hard Credit Inquiries (Hard Pulls):</strong></p>
            <p>If you accept a lender&apos;s pre-qualification offer and proceed with that lender, the lender may perform a <strong>hard credit inquiry</strong> to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Verify your credit information</li>
              <li>Make a final credit decision</li>
              <li>Determine final loan terms and interest rates</li>
            </ul>
            <p>A hard credit inquiry:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>May temporarily lower your credit score</strong> by a few points (typically 5-10 points)</li>
              <li>Is visible to other lenders and creditors on your credit report</li>
              <li>Remains on your credit report for up to 2 years, but generally affects your score for only 12 months</li>
              <li>Is performed by the lender, not by Auto Loan Pro</li>
              <li>Requires your explicit consent before it is performed</li>
            </ul>

            <p className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700">
              <strong>Important:</strong> Auto Loan Pro performs only soft credit inquiries. We do not perform hard credit inquiries. If you choose to proceed with a lender, that lender will request your consent before performing a hard inquiry.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Rights Under the FCRA</h2>

            <p><strong>1. Right to Access Your Credit Report</strong></p>
            <p>You have the right to obtain a free copy of your credit report once every 12 months from each of the three major credit reporting agencies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Equifax: <a href="https://www.equifax.com" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.equifax.com</a></li>
              <li>Experian: <a href="https://www.experian.com" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.experian.com</a></li>
              <li>TransUnion: <a href="https://www.transunion.com" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.transunion.com</a></li>
            </ul>
            <p>To request your free annual credit reports, visit <a href="https://www.annualcreditreport.com" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.annualcreditreport.com</a>, the only authorized website for free credit reports, or call 1-877-322-8228.</p>

            <p><strong>2. Right to Dispute Inaccurate Information</strong></p>
            <p>If you find inaccurate, incomplete, or unverifiable information on your credit report, you have the right to dispute it with the credit reporting agency. The agency must investigate your dispute (usually within 30 days) and correct or remove inaccurate information.</p>

            <p><strong>3. Right to Be Notified of Adverse Actions</strong></p>
            <p>If a lender denies your loan application or offers you less favorable terms based on information in your credit report, the lender must provide you with an &quot;adverse action notice&quot; that includes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The name, address, and phone number of the credit reporting agency that provided the report</li>
              <li>A statement that the credit reporting agency did not make the decision and cannot explain why it was made</li>
              <li>Information about your right to dispute the accuracy of your credit report</li>
              <li>Your right to obtain a free credit report within 60 days of the adverse action</li>
            </ul>

            <p><strong>4. Right to Opt Out of Prescreened Offers</strong></p>
            <p>You have the right to opt out of receiving prescreened offers of credit and insurance. To opt out, call 1-888-567-8688 or visit <a href="https://www.optoutprescreen.com" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.optoutprescreen.com</a>.</p>

            <p><strong>5. Right to Limit Information Sharing</strong></p>
            <p>You can limit certain types of information sharing by credit reporting agencies and financial institutions. Contact the credit bureaus and your financial institutions to learn more about your options.</p>

            <p><strong>6. Right to Seek Damages</strong></p>
            <p>If your rights under the FCRA are violated, you may be entitled to damages, including actual damages, punitive damages, and attorney&apos;s fees.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Dispute Errors on Your Credit Report</h2>
            <p>If you believe there is an error on your credit report, follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Contact the Credit Reporting Agency:</strong> Notify the credit bureau in writing about the inaccurate information. Include copies of supporting documents (do not send originals). Clearly identify each item you dispute, explain why you dispute it, and request that it be corrected or removed.</li>
              <li><strong>Contact the Information Furnisher:</strong> Notify the company that provided the information to the credit bureau (e.g., a creditor or lender). Inform them in writing that you dispute the information.</li>
              <li><strong>Investigation:</strong> The credit bureau must investigate your dispute, usually within 30 days, and forward all relevant information to the information furnisher.</li>
              <li><strong>Review Results:</strong> The credit bureau must provide you with the results of the investigation in writing and a free copy of your credit report if the dispute results in a change.</li>
              <li><strong>Add a Statement:</strong> If your dispute is not resolved to your satisfaction, you have the right to add a statement of dispute (up to 100 words) to your credit report explaining your side of the story.</li>
            </ol>

            <p className="mt-4">Mailing addresses for disputes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Equifax:</strong> P.O. Box 740256, Atlanta, GA 30374</li>
              <li><strong>Experian:</strong> P.O. Box 4500, Allen, TX 75013</li>
              <li><strong>TransUnion:</strong> P.O. Box 2000, Chester, PA 19016</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Filing a Complaint</h2>

            <p><strong>Consumer Financial Protection Bureau (CFPB):</strong></p>
            <p>If you believe your FCRA rights have been violated, you can file a complaint with the Consumer Financial Protection Bureau:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Online: <a href="https://www.consumerfinance.gov/complaint/" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.consumerfinance.gov/complaint</a></li>
              <li>Phone: 1-855-411-CFPB (2372)</li>
              <li>Mail: Consumer Financial Protection Bureau, P.O. Box 4503, Iowa City, IA 52244</li>
            </ul>

            <p><strong>Federal Trade Commission (FTC):</strong></p>
            <p>You can also file a complaint with the Federal Trade Commission:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Online: <a href="https://www.ftccomplaintassistant.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.ftccomplaintassistant.gov</a></li>
              <li>Phone: 1-877-FTC-HELP (1-877-382-4357)</li>
              <li>Mail: Federal Trade Commission, Consumer Response Center, 600 Pennsylvania Avenue NW, Washington, DC 20580</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Resources</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>FTC FCRA Summary: <a href="https://www.consumer.ftc.gov/articles/pdf-0096-fair-credit-reporting-act.pdf" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">FTC FCRA Guide (PDF)</a></li>
              <li>CFPB Credit Reports: <a href="https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.consumerfinance.gov/credit-reports</a></li>
              <li>Annual Credit Report: <a href="https://www.annualcreditreport.com" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.annualcreditreport.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Auto Loan Pro</h2>
            <p>If you have questions about how Auto Loan Pro uses credit information or your FCRA rights, please contact us at:</p>
            <p>
              <strong>Auto Loan Pro LLC</strong><br />
              Email: <a href="mailto:privacy@autoloanpro.co" className="text-blue-600 hover:text-blue-500">privacy@autoloanpro.co</a><br />
              Address: Austin, Texas
            </p>
          </section>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200">
          <Link href="/disclosures" className="text-sm text-blue-600 hover:text-blue-500">← Back to Disclosures</Link>
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
