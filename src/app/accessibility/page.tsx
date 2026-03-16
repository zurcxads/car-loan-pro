/* eslint-disable react/no-unescaped-entities */
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Accessibility Statement',
  description: 'Read Auto Loan Pro accessibility commitments, standards, and support options for users with disabilities.',
  path: '/accessibility',
});

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E3E8EE] bg-[#F6F9FC]">
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold text-[#0A2540]">Accessibility Statement</h1>
          <p className="mt-4 text-lg text-[#425466]">
            Auto Loan Pro is committed to ensuring digital accessibility for people with disabilities.
            We are continually improving the user experience for everyone.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Commitment */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Our Commitment
          </h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <p className="text-sm text-gray-700 mb-4">
              We are committed to providing a website that is accessible to the widest possible audience,
              regardless of technology or ability. We aim to comply with the{' '}
              <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards.
            </p>
            <p className="text-sm text-gray-700">
              We believe that everyone should have equal access to financial services, and we work
              continuously to improve the accessibility of our platform.
            </p>
          </div>
        </section>

        {/* What We've Done */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accessibility Features
          </h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Keyboard Navigation:</strong>
                  <p className="text-sm text-gray-700">
                    All interactive elements can be accessed using only a keyboard (Tab, Enter, Arrow keys).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Screen Reader Support:</strong>
                  <p className="text-sm text-gray-700">
                    Semantic HTML and ARIA labels ensure compatibility with screen readers (NVDA, JAWS, VoiceOver).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Color Contrast:</strong>
                  <p className="text-sm text-gray-700">
                    All text meets WCAG 2.1 AA contrast ratios (4.5:1 for body text, 3:1 for large text).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Resizable Text:</strong>
                  <p className="text-sm text-gray-700">
                    Text can be resized up to 200% without loss of content or functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Focus Indicators:</strong>
                  <p className="text-sm text-gray-700">
                    Clear visual focus indicators on all interactive elements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Form Labels:</strong>
                  <p className="text-sm text-gray-700">
                    All form fields have clear, descriptive labels and error messages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Responsive Design:</strong>
                  <p className="text-sm text-gray-700">
                    Fully functional on mobile devices, tablets, and desktops.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Alternative Text:</strong>
                  <p className="text-sm text-gray-700">
                    All images and icons include descriptive alt text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Known Limitations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Known Limitations
          </h2>
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Third-Party Integrations:</strong>
                  <p className="text-sm text-gray-700">
                    Some third-party services (credit bureaus, lender portals) may not be fully accessible.
                    We are working with partners to improve this.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">PDF Documents:</strong>
                  <p className="text-sm text-gray-700">
                    Pre-approval letters are generated as PDFs. We're working on making these fully accessible
                    and providing HTML alternatives.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sm text-gray-900">Complex Tables:</strong>
                  <p className="text-sm text-gray-700">
                    Offer comparison tables may be difficult to navigate with screen readers.
                    We're adding better table headers and navigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testing */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Testing & Compliance
          </h2>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <p className="text-sm text-gray-700 mb-4">
              We regularly test our website using:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Automated accessibility scanners (Axe, Lighthouse)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Manual testing with keyboard navigation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Screen reader testing (NVDA, JAWS, VoiceOver)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Color contrast analyzers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>User testing with people with disabilities</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Feedback */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Report an Accessibility Issue
          </h2>
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-4">
                  If you encounter an accessibility barrier on our website, please let us know.
                  We're committed to fixing issues quickly.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-900">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:accessibility@autoloanpro.co" className="text-blue-600 hover:underline">
                      accessibility@autoloanpro.co
                    </a>
                  </p>
                  <p className="text-gray-700">
                    Please include:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>The page URL where you encountered the issue</li>
                    <li>A description of the problem</li>
                    <li>The assistive technology you're using (if applicable)</li>
                    <li>Your browser and operating system</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    <strong>Response Time:</strong> We aim to respond within 2 business days and resolve issues within 30 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500">
          <p>Last updated: March 13, 2026</p>
          <p className="mt-2">
            This statement is reviewed and updated quarterly to reflect our ongoing accessibility improvements.
          </p>
        </div>
      </div>
    </div>
  );
}
