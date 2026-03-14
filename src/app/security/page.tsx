/* eslint-disable react/no-unescaped-entities */
import { Shield, Lock, Eye, FileCheck, Trash2, UserCheck, Clock, AlertTriangle, Check, X } from 'lucide-react';
import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Security and Data Protection',
  description: 'Learn how Auto Loan Pro protects personal and financial information with layered security and compliance controls.',
  path: '/security',
});

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: '256-bit SSL encryption for all data in transit and AES-256 encryption for data at rest. Your information is protected with bank-level security.',
    },
    {
      icon: Shield,
      title: 'Soft Pull Only',
      description: 'We only perform soft credit inquiries that do not affect your credit score. Your credit remains protected throughout the pre-approval process.',
    },
    {
      icon: UserCheck,
      title: 'Access Controls',
      description: 'Multi-factor authentication and role-based access controls ensure only authorized personnel can access sensitive data.',
    },
    {
      icon: Eye,
      title: 'Limited Data Sharing',
      description: 'We only share your information with lenders you select. Your data is never sold to third parties or used for marketing without consent.',
    },
    {
      icon: FileCheck,
      title: 'Compliance',
      description: 'Fully compliant with FCRA, ECOA, GLBA, and state consumer protection laws. We maintain strict regulatory standards.',
    },
    {
      icon: Clock,
      title: 'Data Retention',
      description: 'Applications are retained for 7 years per federal requirements. Documents are securely deleted within 30 days of deal completion.',
    },
    {
      icon: Trash2,
      title: 'Right to Delete',
      description: 'You can request deletion of your data at any time, subject to legal retention requirements. We honor all CCPA and GDPR rights.',
    },
    {
      icon: AlertTriangle,
      title: 'Breach Notification',
      description: 'In the unlikely event of a data breach, we will notify affected users within 72 hours and provide free credit monitoring.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">Security & Data Protection</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">
            Your privacy and security are our top priorities. Here's how we protect your personal and financial information.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          {/* Who Sees Your Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-4">
              Who Sees Your Data
            </h2>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
              <div className="space-y-4 text-sm text-gray-700 dark:text-zinc-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-950/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <strong>Lenders You Select:</strong> When you choose to view an offer, only that specific lender receives your full application details.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-950/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <strong>Credit Bureaus (Soft Pull):</strong> We perform a soft inquiry to provide you with accurate pre-approval offers.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <strong>Marketing Companies:</strong> We never sell your data to third-party marketers or data brokers.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <strong>Unrelated Lenders:</strong> Lenders you don't select never receive your personal information.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Data Deletion */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-4">
              How to Delete Your Data
            </h2>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
              <p className="text-sm text-gray-700 dark:text-zinc-300 mb-4">
                You have the right to request deletion of your personal information at any time. Here's how:
              </p>
              <ol className="space-y-3 text-sm text-gray-700 dark:text-zinc-300 list-decimal list-inside">
                <li>Email <strong>privacy@autoloanpro.co</strong> with "Data Deletion Request" in the subject line</li>
                <li>Include your full name, email, and application ID (if available)</li>
                <li>We will confirm your identity and process your request within 30 days</li>
                <li>You will receive confirmation once your data has been deleted</li>
              </ol>
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Some data may be retained for legal compliance (e.g., FCRA requires 7-year retention of credit inquiries). We will inform you of any data that cannot be deleted and why.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Security Team */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-4">
              Contact Our Security Team
            </h2>
            <div className="bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-gray-200 dark:border-zinc-800">
              <p className="text-sm text-gray-700 dark:text-zinc-300 mb-4">
                Have questions about our security practices or want to report a concern?
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700 dark:text-zinc-300">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:security@autoloanpro.co" className="text-blue-600 hover:underline">
                    security@autoloanpro.co
                  </a>
                </p>
                <p className="text-gray-700 dark:text-zinc-300">
                  <strong>Privacy Inquiries:</strong>{' '}
                  <a href="mailto:privacy@autoloanpro.co" className="text-blue-600 hover:underline">
                    privacy@autoloanpro.co
                  </a>
                </p>
                <p className="text-gray-700 dark:text-zinc-300">
                  <strong>Response Time:</strong> Within 48 hours
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-2">
            Your Data is Never Sold
          </h3>
          <p className="text-blue-100 max-w-2xl mx-auto">
            We make money from referral fees when you get funded, not from selling your data.
            Your privacy is protected, guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
}
