"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } } };

export default function StateDisclosuresPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/apply" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors duration-200">Apply Now</Link>
        </div>
      </nav>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">State-Specific Disclosures</h1>
        <p className="text-sm text-gray-500 mb-10">Important Information for Residents of Specific States</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">General Notice</h2>
            <p>Auto Loan Pro operates as an online auto loan marketplace connecting consumers with licensed lenders. The following state-specific disclosures apply to residents of certain states. If your state is not listed below, additional disclosures may still apply based on your state&apos;s consumer protection and lending laws.</p>
            <p className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700">
              <strong>Important:</strong> Auto Loan Pro is <strong>not a lender</strong> and does not originate, fund, or service loans. We are a marketplace that connects consumers with third-party lenders. All loan products, rates, terms, and approval decisions are made by the participating lenders.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Texas Residents</h2>
            <p><strong>Texas Finance Code Notice:</strong></p>
            <p>Auto Loan Pro LLC is headquartered in Austin, Texas. We are <strong>not</strong> a licensed lender under the Texas Finance Code or the Texas Credit Services Organization Act. We do not make loans, extend credit, or charge fees for credit services.</p>
            <p>Auto Loan Pro operates as a marketplace connecting consumers with licensed lenders who are authorized to make loans in Texas. Each lender in our network that operates in Texas holds the appropriate licenses or exemptions required under Texas law.</p>
            <p><strong>Texas Consumer Credit Code:</strong></p>
            <p>Loans made by lenders in our network to Texas residents are governed by the Texas Finance Code and may be subject to rate caps, disclosure requirements, and other consumer protections under Texas law. Contact the lender directly for information about their Texas licensing and compliance.</p>
            <p><strong>Texas Office of Consumer Credit Commissioner:</strong></p>
            <p>If you have questions or complaints regarding a lender&apos;s compliance with Texas lending laws, you may contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Office of Consumer Credit Commissioner (OCCC)</li>
              <li>2601 N. Lamar Blvd., Austin, TX 78705</li>
              <li>Phone: 1-800-538-1579</li>
              <li>Website: <a href="https://occc.texas.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">occc.texas.gov</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">California Residents</h2>

            <p><strong>California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</strong></p>
            <p>California residents have additional privacy rights under the CCPA and CPRA. For detailed information about your California privacy rights, including the right to know, delete, correct, and opt out of the sale or sharing of personal information, please see our <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>.</p>

            <p><strong>California Finance Lenders Law:</strong></p>
            <p>Lenders in our network that make loans to California residents are required to be licensed under the California Finance Lenders Law (CFLL) or the California Residential Mortgage Lending Act (CRMLA), or must be exempt from licensing. Auto Loan Pro does not hold a California Finance Lenders License or California Residential Mortgage Lender License because we do not make loans.</p>

            <p><strong>California Department of Financial Protection and Innovation (DFPI):</strong></p>
            <p>Licensed lenders operating in California are regulated by the California DFPI. If you have questions or complaints about a lender, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>California Department of Financial Protection and Innovation</li>
              <li>2101 Arena Blvd., Sacramento, CA 95834</li>
              <li>Phone: 1-866-275-2677</li>
              <li>Website: <a href="https://dfpi.ca.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">dfpi.ca.gov</a></li>
            </ul>

            <p><strong>California Credit Discrimination Notice:</strong></p>
            <p>Pursuant to California Civil Code Section 1812.30, the married California applicant may apply for a separate account. California residents are protected by the Unruh Civil Rights Act and the California Fair Employment and Housing Act from discrimination based on protected characteristics.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">New York Residents</h2>

            <p><strong>New York Department of Financial Services (DFS) Notice:</strong></p>
            <p>Lenders operating in New York are regulated by the New York Department of Financial Services. Auto Loan Pro does not hold a lending license in New York because we are not a lender.</p>

            <p><strong>New York Banking Law:</strong></p>
            <p>Loans made by lenders in our network to New York residents are subject to the New York Banking Law, which may include interest rate caps, disclosure requirements, and licensing requirements for lenders.</p>

            <p><strong>Complaints:</strong></p>
            <p>If you have complaints or questions regarding a lender&apos;s compliance with New York law, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>New York Department of Financial Services</li>
              <li>One State Street, New York, NY 10004</li>
              <li>Phone: 1-800-342-3736</li>
              <li>Website: <a href="https://www.dfs.ny.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">dfs.ny.gov</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Florida Residents</h2>

            <p><strong>Florida Consumer Finance Act Notice:</strong></p>
            <p>Lenders making consumer finance loans in Florida are required to be licensed under the Florida Consumer Finance Act. Auto Loan Pro is not a licensed lender in Florida and does not make consumer finance loans.</p>

            <p><strong>Florida Office of Financial Regulation:</strong></p>
            <p>Licensed lenders in Florida are regulated by the Florida Office of Financial Regulation. For questions or complaints about a lender, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Florida Office of Financial Regulation</li>
              <li>200 East Gaines Street, Tallahassee, FL 32399</li>
              <li>Phone: 1-850-487-9687</li>
              <li>Website: <a href="https://www.flofr.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">flofr.gov</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Illinois Residents</h2>

            <p><strong>Illinois Consumer Installment Loan Act Notice:</strong></p>
            <p>Lenders making consumer installment loans in Illinois may be required to be licensed under the Illinois Consumer Installment Loan Act (CILA). Auto Loan Pro does not hold an Illinois lending license because we are not a lender.</p>

            <p><strong>Illinois Department of Financial and Professional Regulation:</strong></p>
            <p>For questions or complaints about a lender in Illinois, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Illinois Department of Financial and Professional Regulation</li>
              <li>320 West Washington Street, Springfield, IL 62786</li>
              <li>Phone: 1-888-473-4858</li>
              <li>Website: <a href="https://www.idfpr.com" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">idfpr.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Ohio Residents</h2>

            <p><strong>Ohio Mortgage Loan Act Notice:</strong></p>
            <p>Auto Loan Pro does not hold an Ohio Mortgage Loan Act license or a Certificate of Registration as a Mortgage Broker because we do not make loans or broker loans.</p>

            <p><strong>Ohio Division of Financial Institutions:</strong></p>
            <p>Lenders operating in Ohio are regulated by the Ohio Division of Financial Institutions. For questions or complaints, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ohio Division of Financial Institutions</li>
              <li>77 South High Street, 21st Floor, Columbus, OH 43215</li>
              <li>Phone: 1-866-278-0003</li>
              <li>Website: <a href="https://www.com.ohio.gov/divisions/financial-institutions" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">com.ohio.gov/fid</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Massachusetts Residents</h2>

            <p><strong>Massachusetts Division of Banks Notice:</strong></p>
            <p>Lenders making loans in Massachusetts are regulated by the Massachusetts Division of Banks. Auto Loan Pro does not hold a Massachusetts lending license.</p>

            <p><strong>Complaints:</strong></p>
            <p>For questions or complaints about a lender in Massachusetts, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Massachusetts Division of Banks</li>
              <li>1000 Washington Street, Boston, MA 02118</li>
              <li>Phone: 1-800-495-2265</li>
              <li>Website: <a href="https://www.mass.gov/dob" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">mass.gov/dob</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Arizona Residents</h2>

            <p><strong>Arizona Community Property Notice:</strong></p>
            <p>Arizona is a community property state. If you are married and applying for individual credit, certain income and property considerations may apply. Consult with the lender for details.</p>

            <p><strong>Arizona Department of Insurance and Financial Institutions:</strong></p>
            <p>For questions or complaints about a lender in Arizona, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Arizona Department of Insurance and Financial Institutions</li>
              <li>100 North 15th Avenue, Suite 261, Phoenix, AZ 85007</li>
              <li>Phone: 1-602-364-3100</li>
              <li>Website: <a href="https://difi.az.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">difi.az.gov</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Washington Residents</h2>

            <p><strong>Washington State Consumer Loan Act Notice:</strong></p>
            <p>Lenders making consumer loans in Washington are subject to the Washington State Consumer Loan Act. Auto Loan Pro does not hold a Washington consumer loan license because we do not make loans.</p>

            <p><strong>Washington Department of Financial Institutions:</strong></p>
            <p>For questions or complaints, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Washington Department of Financial Institutions</li>
              <li>P.O. Box 41200, Olympia, WA 98504-1200</li>
              <li>Phone: 1-877-746-4334</li>
              <li>Website: <a href="https://dfi.wa.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">dfi.wa.gov</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Nevada Residents</h2>

            <p><strong>Nevada Community Property Notice:</strong></p>
            <p>Nevada is a community property state. If you are married and applying for individual credit, certain considerations may apply.</p>

            <p><strong>Nevada Department of Business and Industry, Financial Institutions Division:</strong></p>
            <p>For questions or complaints about a lender in Nevada, contact:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Nevada Financial Institutions Division</li>
              <li>1830 College Parkway, Suite 100, Carson City, NV 89706</li>
              <li>Phone: 1-775-684-2999</li>
              <li>Website: <a href="https://fid.nv.gov" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">fid.nv.gov</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Other States</h2>
            <p>If you reside in a state not listed above, state-specific lending laws, licensing requirements, and consumer protections may still apply. Lenders in the Auto Loan Pro network are required to comply with all applicable state and federal laws.</p>
            <p>For information about your state&apos;s consumer lending laws and regulatory agencies, consult your state&apos;s banking or financial services department.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">NMLS Consumer Access</h2>
            <p>Many lenders in our network are registered with the Nationwide Multistate Licensing System (NMLS). You can verify a lender&apos;s license status and view regulatory information at:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><a href="https://www.nmlsconsumeraccess.org" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">www.nmlsconsumeraccess.org</a></li>
            </ul>
            <p><strong>Auto Loan Pro NMLS Status:</strong> Not applicable. Auto Loan Pro is not a lender, mortgage broker, or loan originator and is not required to be licensed under the SAFE Act or state licensing laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Auto Loan Pro</h2>
            <p>If you have questions about state-specific disclosures or regulatory compliance, please contact us at:</p>
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
