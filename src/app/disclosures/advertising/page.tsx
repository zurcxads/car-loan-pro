"use client";

import Link from 'next/link';

export default function AdvertisingDisclosuresPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <div className="animate-fadeIn max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Advertising Disclosures</h1>
        <p className="text-sm text-gray-500 mb-10">Important Information About Rates and Terms</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">APR Ranges and Rate Estimates</h2>
            <p>Annual Percentage Rates (APRs) and interest rates advertised on the Auto Loan Pro platform are estimates based on general market conditions and credit tier assumptions. Actual rates offered by lenders will vary based on individual applicant creditworthiness and other factors.</p>

            <p className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-gray-700">
              <strong>Advertised APR Range:</strong> 2.9% - 16.0%
            </p>

            <p><strong>Important:</strong> The APR range shown represents the lowest and highest rates currently available through lenders in our network. Your actual APR may fall outside this range depending on your credit profile, loan amount, loan term, vehicle type, and other factors. Not all applicants will qualify for the lowest rates advertised.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Factors That Affect Your Rate</h2>
            <p>Lenders determine your interest rate and APR based on multiple factors, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Credit Score:</strong> Higher credit scores generally qualify for lower rates</li>
              <li><strong>Credit History:</strong> Length and quality of your credit history</li>
              <li><strong>Debt-to-Income Ratio:</strong> Your monthly debt obligations relative to your income</li>
              <li><strong>Loan Amount:</strong> The total amount you are borrowing</li>
              <li><strong>Loan Term:</strong> The length of the loan (e.g., 36, 48, 60, 72, or 84 months)</li>
              <li><strong>Vehicle Type:</strong> New, used, or certified pre-owned; year, make, and model</li>
              <li><strong>Down Payment:</strong> The amount of cash you put down upfront</li>
              <li><strong>Employment and Income:</strong> Stability of employment and income level</li>
              <li><strong>State of Residence:</strong> Rates may vary by state due to regulatory differences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Representative Examples</h2>
            <p>The following examples illustrate potential loan scenarios. Your actual terms may differ.</p>

            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-2">Example 1: Prime Credit (700+ FICO)</p>
                <ul className="text-sm space-y-1">
                  <li>Loan Amount: $25,000</li>
                  <li>APR: 4.5%</li>
                  <li>Term: 60 months</li>
                  <li>Estimated Monthly Payment: $466</li>
                  <li>Total Interest Paid: $2,960</li>
                  <li>Total Amount Paid: $27,960</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-2">Example 2: Near-Prime Credit (640-699 FICO)</p>
                <ul className="text-sm space-y-1">
                  <li>Loan Amount: $25,000</li>
                  <li>APR: 7.9%</li>
                  <li>Term: 60 months</li>
                  <li>Estimated Monthly Payment: $506</li>
                  <li>Total Interest Paid: $5,360</li>
                  <li>Total Amount Paid: $30,360</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-2">Example 3: Subprime Credit (580-639 FICO)</p>
                <ul className="text-sm space-y-1">
                  <li>Loan Amount: $25,000</li>
                  <li>APR: 11.9%</li>
                  <li>Term: 60 months</li>
                  <li>Estimated Monthly Payment: $556</li>
                  <li>Total Interest Paid: $8,360</li>
                  <li>Total Amount Paid: $33,360</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-2">Example 4: Used Vehicle (2020 Model)</p>
                <ul className="text-sm space-y-1">
                  <li>Loan Amount: $18,000</li>
                  <li>APR: 6.5% (assuming 680 FICO)</li>
                  <li>Term: 48 months</li>
                  <li>Estimated Monthly Payment: $428</li>
                  <li>Total Interest Paid: $2,544</li>
                  <li>Total Amount Paid: $20,544</li>
                </ul>
              </div>
            </div>

            <p className="mt-4 text-sm italic">These examples are for illustrative purposes only. Your actual loan terms, rates, and payments may differ significantly based on your individual financial profile and the lender&apos;s underwriting criteria.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Pre-Approval vs. Final Approval</h2>

            <p><strong>Pre-Approval Is Not a Guarantee:</strong></p>
            <p>Pre-approval offers displayed on the Auto Loan Pro platform are preliminary estimates based on the information you provided and a soft credit inquiry. Pre-approval does <strong>not</strong> guarantee:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Final loan approval</li>
              <li>The specific interest rate or APR shown in the pre-approval</li>
              <li>The loan amount or terms shown in the pre-approval</li>
            </ul>

            <p><strong>Subject to Verification:</strong></p>
            <p>All pre-approval offers are conditional and subject to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Verification of your income, employment, and identity</li>
              <li>A hard credit inquiry by the lender (which may impact your credit score)</li>
              <li>Review and approval of the vehicle you intend to finance</li>
              <li>Appraisal or inspection of the vehicle</li>
              <li>Final underwriting by the lender</li>
            </ul>

            <p><strong>Rates May Change:</strong></p>
            <p>The interest rate and terms in your pre-approval offer may change after the lender performs a hard credit inquiry and completes final underwriting. Rates are subject to change based on market conditions, and pre-approval offers typically have expiration dates (commonly 30-45 days).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Not All Applicants Will Qualify</h2>
            <p>The rates, terms, and loan amounts advertised on Auto Loan Pro are available to qualified borrowers who meet lender credit criteria. Not all applicants will qualify for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The lowest rates advertised</li>
              <li>The highest loan amounts advertised</li>
              <li>The longest loan terms advertised</li>
              <li>Approval for any loan offer</li>
            </ul>
            <p>Lenders reserve the right to deny applications or offer alternative terms based on their underwriting guidelines. Approval is not guaranteed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">APR vs. Interest Rate</h2>

            <p><strong>Interest Rate:</strong></p>
            <p>The interest rate is the cost of borrowing money, expressed as a percentage of the loan principal. It does not include additional fees or charges.</p>

            <p><strong>Annual Percentage Rate (APR):</strong></p>
            <p>The APR is a broader measure of the cost of borrowing that includes the interest rate plus certain fees and charges, such as:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Origination fees</li>
              <li>Documentation fees</li>
              <li>Processing fees</li>
            </ul>
            <p>The APR is typically higher than the interest rate because it includes these additional costs. The APR provides a more accurate representation of the total cost of the loan.</p>

            <p className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700 mt-4">
              <strong>Example:</strong> A loan might have an interest rate of 5.5% but an APR of 5.8% due to $500 in origination fees.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Fees and Costs</h2>
            <p>In addition to the interest rate and APR, you may be responsible for other costs associated with your auto loan, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Down Payment:</strong> Upfront cash payment (if required or chosen)</li>
              <li><strong>Sales Tax:</strong> State and local sales tax on the vehicle purchase (may be financed in some cases)</li>
              <li><strong>Registration and Title Fees:</strong> Fees to register and title the vehicle in your name</li>
              <li><strong>Dealer Fees:</strong> Documentation fees, processing fees, or dealer preparation fees</li>
              <li><strong>Gap Insurance:</strong> Optional insurance covering the difference between the vehicle&apos;s value and the loan balance in case of total loss</li>
              <li><strong>Extended Warranty:</strong> Optional service contract covering repairs beyond the manufacturer&apos;s warranty</li>
              <li><strong>Prepayment Penalty:</strong> Some lenders may charge a fee if you pay off the loan early (check with your lender)</li>
              <li><strong>Late Payment Fee:</strong> Fee charged if you miss a payment or pay late</li>
            </ul>
            <p>These fees and costs vary by lender, state, and dealer. Review your loan documents carefully before signing.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Lender-Specific Terms</h2>
            <p>Each lender in the Auto Loan Pro network has its own underwriting guidelines, approval criteria, and loan terms. Terms may vary significantly between lenders, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Minimum and maximum loan amounts</li>
              <li>Available loan terms (e.g., 36, 48, 60, 72, or 84 months)</li>
              <li>Eligible vehicle types (new, used, certified pre-owned)</li>
              <li>Eligible vehicle years</li>
              <li>Geographic restrictions (some lenders may not operate in all states)</li>
            </ul>
            <p>Review the lender&apos;s specific terms and conditions before accepting an offer.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Rate Lock and Expiration</h2>
            <p>Pre-approval offers typically include a rate lock period during which the offered rate is guaranteed, subject to final approval and verification. Rate lock periods vary by lender but are commonly 30-45 days.</p>
            <p>If you do not complete your loan application and finalize the purchase within the rate lock period, the rate may expire, and you may need to reapply or accept a different rate based on current market conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Auto Loan Pro Is Not a Lender</h2>
            <p>Auto Loan Pro is a marketplace that connects consumers with lenders. We do not:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Set interest rates or loan terms</li>
              <li>Make credit decisions or approve loans</li>
              <li>Guarantee any specific rate, term, or approval</li>
              <li>Originate, fund, or service loans</li>
            </ul>
            <p>All loan products, rates, terms, and approval decisions are made solely by the participating lenders in our network. Auto Loan Pro earns a referral fee from lenders when a loan is successfully funded.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Regulatory Compliance</h2>
            <p>All advertising and disclosures on the Auto Loan Pro platform comply with applicable federal and state laws, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Truth in Lending Act (TILA) and Regulation Z</li>
              <li>Equal Credit Opportunity Act (ECOA)</li>
              <li>Fair Credit Reporting Act (FCRA)</li>
              <li>State-specific lending and advertising regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Questions?</h2>
            <p>If you have questions about advertised rates, terms, or disclosures, please contact us at:</p>
            <p>
              <strong>Auto Loan Pro LLC</strong><br />
              Email: <a href="mailto:support@autoloanpro.co" className="text-blue-600 hover:text-blue-500">support@autoloanpro.co</a><br />
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
