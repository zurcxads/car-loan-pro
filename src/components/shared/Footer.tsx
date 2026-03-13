import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm mb-10">
          <div>
            <div className="font-semibold text-gray-900 mb-4">Product</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/how-it-works" className="block hover:text-gray-900 transition-colors duration-200">How It Works</Link>
              <Link href="/calculator" className="block hover:text-gray-900 transition-colors duration-200">Calculator</Link>
              <Link href="/apply" className="block hover:text-gray-900 transition-colors duration-200">Apply Now</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-4">Company</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/about" className="block hover:text-gray-900 transition-colors duration-200">About</Link>
              <Link href="/contact" className="block hover:text-gray-900 transition-colors duration-200">Contact</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-4">Legal</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/terms" className="block hover:text-gray-900 transition-colors duration-200">Terms</Link>
              <Link href="/privacy" className="block hover:text-gray-900 transition-colors duration-200">Privacy</Link>
              <Link href="/disclosures/fcra" className="block hover:text-gray-900 transition-colors duration-200">FCRA</Link>
              <Link href="/disclosures/ecoa" className="block hover:text-gray-900 transition-colors duration-200">ECOA</Link>
              <Link href="/disclosures" className="block hover:text-gray-900 transition-colors duration-200">Disclosures</Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-4">Support</div>
            <div className="space-y-3 text-gray-500">
              <Link href="/login" className="block hover:text-gray-900 transition-colors duration-200">Sign In</Link>
              <Link href="/contact" className="block hover:text-gray-900 transition-colors duration-200">Help Center</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <p className="text-xs text-gray-700 leading-relaxed mb-3">
              <strong>Auto Loan Pro is a marketplace connecting consumers with auto lenders.</strong> Auto Loan Pro is not a lender, broker, or loan servicer. All loan products, terms, rates, and approval decisions are made by participating lenders. Not all applicants will qualify. Rates and terms are subject to change.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              <strong>NMLS ID:</strong> [Pending] — Auto Loan Pro is a marketplace connecting consumers with lenders. We are not a lender, broker, or loan servicer.
            </p>
          </div>

          <div className="bg-gray-100 rounded-xl p-5 mb-6">
            <p className="text-xs text-gray-700 leading-relaxed">
              <strong>APR Disclosure:</strong> APR ranges from 2.9% to 16.0% depending on creditworthiness, loan amount, and term. Example: $25,000 at 4.5% APR for 60 months = approximately $466/month. Your actual rate may differ. Not all applicants will qualify for the lowest rates advertised.
            </p>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Copyright © 2026 Auto Loan Pro LLC. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
