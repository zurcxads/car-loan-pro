"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { showDevTools } from '@/lib/env';

interface ReferralStats {
  totalInvites: number;
  applied: number;
  funded: number;
  totalRewards: number;
  paidRewards: number;
}

interface Referral {
  id: number;
  referee_email: string;
  status: string;
  reward_amount: number;
  reward_paid: boolean;
  created_at: string;
  funded_at?: string;
}

function ReferralsContent() {
  const router = useRouter();
  const isDev = showDevTools();

  const [referralUrl, setReferralUrl] = useState('');
  const [stats, setStats] = useState<ReferralStats>({
    totalInvites: 0,
    applied: 0,
    funded: 0,
    totalRewards: 0,
    paidRewards: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDev) {
      setReferralUrl(`${window.location.origin}/apply?ref=ALP-DEV-001`);
      setStats({
        totalInvites: 8,
        applied: 5,
        funded: 3,
        totalRewards: 150,
        paidRewards: 100,
      });
      setReferrals([
        {
          id: 1,
          referee_email: 'alex@example.com',
          status: 'funded',
          reward_amount: 50,
          reward_paid: true,
          created_at: new Date().toISOString(),
          funded_at: new Date().toISOString(),
        },
        {
          id: 2,
          referee_email: 'jamie@example.com',
          status: 'applied',
          reward_amount: 50,
          reward_paid: false,
          created_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      return;
    }

    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.data?.application) {
          router.push('/apply');
          return;
        }
        return fetch(`/api/referrals?userId=${data.data.application.id}`);
      })
      .then(res => res?.json())
      .then(data => {
        if (data) {
          setReferralUrl(`${window.location.origin}/apply?ref=${data.referralCode}`);
          setStats(data.stats);
          setReferrals(data.referrals || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router, isDev]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success('Referral link copied!');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out Auto Loan Pro');
    const body = encodeURIComponent(
      `I found Auto Loan Pro and thought you might be interested. They help you get the best auto loan rates from multiple lenders.\n\nApply here: ${referralUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const statusColors: Record<string, string> = {
    registered: 'bg-gray-100 text-gray-700',
    applied: 'bg-blue-100 text-blue-700',
    funded: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading referrals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-gray-900">
            Auto Loan Pro
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="animate-fadeIn">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Program</h1>
            <p className="text-gray-500">Earn $50 for every friend who gets funded through Auto Loan Pro</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Invites</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalInvites}</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Applied</div>
              <div className="text-3xl font-bold text-blue-600">{stats.applied}</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Funded</div>
              <div className="text-3xl font-bold text-green-600">{stats.funded}</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rewards Earned</div>
              <div className="text-3xl font-bold text-gray-900">${stats.totalRewards}</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none"
              />
              <button
                onClick={copyReferralLink}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Copy Link
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={shareViaEmail}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Share via Email
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">1</div>
                <p>Share your unique referral link with friends and family</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">2</div>
                <p>They apply for an auto loan using your link</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold">3</div>
                <p>When their loan is funded, you earn $50</p>
              </div>
            </div>
          </div>

          {/* Referral History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral History</h2>
            {referrals.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">No referrals yet. Start sharing your link!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-xs text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 text-xs text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 text-xs text-gray-500 uppercase tracking-wider">Reward</th>
                      <th className="text-left py-3 text-xs text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map(ref => (
                      <tr key={ref.id} className="border-b border-gray-200">
                        <td className="py-3 text-gray-900">{ref.referee_email}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ref.status]}`}>
                            {ref.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {ref.status === 'funded' ? (
                            <span className="text-green-600 font-semibold">${ref.reward_amount}</span>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </td>
                        <td className="py-3 text-gray-500">{new Date(ref.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReferralsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <ReferralsContent />
    </Suspense>
  );
}
