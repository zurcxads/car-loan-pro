"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState('AUTOLOAN-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);
  const referralLink = `https://autoloanpro.com/apply?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">Auto Loan Pro</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Refer Friends, Earn Rewards
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share Auto Loan Pro with friends and family. When they get approved, you both benefit.
          </p>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-xl font-bold text-gray-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Share Your Link',
                description: 'Send your unique referral link to friends via email, text, or social media.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Friend Applies',
                description: 'Your friend uses your link to apply and gets approved for an auto loan.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Both Benefit',
                description: 'You earn $50 and your friend gets a $25 credit toward their first payment.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-4">
                  {item.icon}
                </div>
                <div className="absolute top-8 left-0 w-full flex justify-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16 p-8 rounded-2xl bg-white border border-gray-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Referral Link</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralCode}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              />
              <button
                onClick={() => {
                  const newCode = 'AUTOLOAN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                  setReferralCode(newCode);
                }}
                className="px-4 py-3 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:?subject=Check out Auto Loan Pro&body=I found this great auto loan platform that saved me money. Get $25 off your first payment when you use my link: ${referralLink}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share via Email
            </a>
            <a
              href={`sms:?body=Check out Auto Loan Pro! Get $25 off your first payment: ${referralLink}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Share via Text
            </a>
          </div>
        </motion.div>

        {/* Referrals Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16 p-8 rounded-2xl bg-white border border-gray-200 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Referrals</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Total Referrals</div>
              <div className="text-3xl font-bold text-blue-600">0</div>
            </div>
            <div className="p-6 rounded-xl bg-green-50 border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">Approved</div>
              <div className="text-3xl font-bold text-green-600">0</div>
            </div>
            <div className="p-6 rounded-xl bg-purple-50 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-1">Earnings</div>
              <div className="text-3xl font-bold text-purple-600">$0</div>
            </div>
          </div>

          <div className="text-center py-12 border-t border-gray-200">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-500 mb-2">No referrals yet</p>
            <p className="text-xs text-gray-400">Share your link above to start earning rewards</p>
          </div>
        </motion.div>

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-8 rounded-2xl bg-gray-50 border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Program Terms</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="text-blue-600 mt-0.5">&bull;</span>
              <p>Referral rewards are paid after your friend&apos;s loan is funded and first payment is received.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 mt-0.5">&bull;</span>
              <p>Your friend must use your unique referral link when applying to qualify for the program.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 mt-0.5">&bull;</span>
              <p>Rewards are paid via direct deposit or as a credit to your account within 30 days of qualification.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 mt-0.5">&bull;</span>
              <p>You may not refer yourself or use multiple accounts to earn referral bonuses.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 mt-0.5">&bull;</span>
              <p>Auto Loan Pro reserves the right to modify or discontinue the referral program at any time.</p>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-600 mt-0.5">&bull;</span>
              <p>Maximum 10 successful referrals per calendar year per account.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
