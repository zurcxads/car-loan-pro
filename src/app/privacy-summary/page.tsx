/* eslint-disable react/no-unescaped-entities */
import { Database, Eye, Share2, Clock, UserX, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy Summary',
  description: 'Read a plain-English summary of how Auto Loan Pro collects, uses, shares, and protects personal information.',
  path: '/privacy-summary',
});

export default function PrivacySummaryPage() {
  const sections = [
    {
      icon: Database,
      title: 'What We Collect',
      color: 'blue',
      items: [
        'Your name, email, phone number, and address',
        'Date of birth and Social Security Number (for credit check)',
        'Employment information (employer, income, job title)',
        'Vehicle information (if you know what you want)',
        'Credit report data (soft pull only)',
      ],
    },
    {
      icon: Eye,
      title: 'Why We Collect It',
      color: 'green',
      items: [
        'To match you with lenders that fit your credit profile',
        'To generate accurate pre-approval offers',
        'To comply with federal lending regulations (FCRA, ECOA)',
        'To prevent fraud and verify your identity',
        'To communicate about your application status',
      ],
    },
    {
      icon: Share2,
      title: 'Who Sees It',
      color: 'purple',
      items: [
        'Lenders you choose when you select an offer',
        'Credit bureaus (for soft credit inquiry only)',
        'Our fraud prevention partners (identity verification)',
        'Nobody else — we never sell your data to marketers',
      ],
    },
    {
      icon: Clock,
      title: 'How Long We Keep It',
      color: 'amber',
      items: [
        'Active applications: Until you get funded or decline',
        'Completed applications: 7 years (federal requirement)',
        'Documents: 30 days after deal completion',
        'Marketing preferences: Until you unsubscribe',
      ],
    },
    {
      icon: UserX,
      title: 'Your Rights',
      color: 'red',
      items: [
        'Access: Request a copy of your data anytime',
        'Correction: Fix any incorrect information',
        'Deletion: Request deletion (subject to legal limits)',
        'Opt-out: Unsubscribe from marketing emails',
        'Portability: Export your data in common formats',
      ],
    },
    {
      icon: FileText,
      title: 'How to Delete Everything',
      color: 'gray',
      items: [
        'Email privacy@autoloanpro.co with your request',
        'We will confirm your identity and process within 30 days',
        'Some data must be kept for 7 years (FCRA requirement)',
        'You will get confirmation when deletion is complete',
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
      red: { bg: 'bg-red-50', text: 'text-red-600' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-600' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy (Plain English)</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            We believe privacy policies should be readable by humans, not just lawyers.
            Here's what we do with your information, in plain English.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const colors = getColorClasses(section.color);

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 ${colors.bg} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className={`mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Key Points */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            The Bottom Line
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <p>
                <strong>We only share with lenders you pick.</strong> If you do not select an offer, that lender never sees your info.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <p>
                <strong>We never sell your data.</strong> Our business model is referral fees from lenders, not selling your information.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <p>
                <strong>Soft pull only.</strong> Checking your rate with us does not hurt your credit score.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <p>
                <strong>You can delete everything.</strong> Email us anytime to request deletion (some data must be kept 7 years by law).
              </p>
            </div>
          </div>
        </div>

        {/* Cookies Notice */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            About Cookies
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            We use essential cookies to make the site work (like remembering you are logged in).
            We do not use tracking cookies or sell data to advertisers.
          </p>
          <p className="text-sm text-gray-600">
            Types of cookies we use:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span><strong>Essential:</strong> Session management, security</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span><strong>Functional:</strong> Remember your preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span><strong>Analytics:</strong> Understand how people use the site (anonymized)</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Questions?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            If you have questions about your privacy or want to exercise your rights, email us:
          </p>
          <a
            href="mailto:privacy@autoloanpro.co"
            className="text-blue-600 hover:underline font-medium"
          >
            privacy@autoloanpro.co
          </a>
        </div>

        {/* Link to Full Privacy Policy */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need the legal version?{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">
              Read our full Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
