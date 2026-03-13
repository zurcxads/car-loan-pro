import Link from 'next/link';
import { Lock, Shield, Check } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Trust Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Soft Pull Only</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="font-medium">FCRA Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Product */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/how-it-works" className="hover:text-blue-600 transition-colors">How It Works</Link></li>
              <li><Link href="/apply" className="hover:text-blue-600 transition-colors">Apply Now</Link></li>
              <li><Link href="/calculator" className="hover:text-blue-600 transition-colors">Calculator</Link></li>
              <li><Link href="/apply" className="hover:text-blue-600 transition-colors">Check Rates</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              <li><Link href="/resources" className="hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="/status" className="hover:text-blue-600 transition-colors">Status</Link></li>
              <li><Link href="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link></li>
              <li><Link href="/disclosures" className="hover:text-blue-600 transition-colors">Disclosures</Link></li>
              <li><Link href="/accessibility" className="hover:text-blue-600 transition-colors">Accessibility</Link></li>
              <li><Link href="/security" className="hover:text-blue-600 transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Partners</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/lenders/onboard" className="hover:text-blue-600 transition-colors">For Lenders</Link></li>
              <li><Link href="/dealers/onboard" className="hover:text-blue-600 transition-colors">For Dealers</Link></li>
              <li><Link href="/api-docs" className="hover:text-blue-600 transition-colors">API Documentation</Link></li>
              <li><Link href="/login" className="hover:text-blue-600 transition-colors">Partner Login</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <p className="text-center md:text-left">
              &copy; 2026 Auto Loan Pro. Auto Loan Pro is a marketplace, not a lender.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/disclosures" className="hover:text-blue-600 transition-colors">Disclosures</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
