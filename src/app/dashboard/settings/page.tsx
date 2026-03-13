"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '' });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    offers: true,
    updates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/apply');
      return;
    }

    fetch(`/api/dashboard?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.application) {
          router.push('/apply');
          return;
        }
        setProfile({
          name: `${data.application.borrower.firstName} ${data.application.borrower.lastName}`,
          email: data.application.borrower.email || '',
          phone: data.application.borrower.phone || '',
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token, router]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Settings saved successfully');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion requested. Please contact support to complete this process.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/dashboard?token=${token}`} className="text-lg font-semibold tracking-tight text-gray-900">
            Auto Loan Pro
          </Link>
          <Link href={`/dashboard?token=${token}`} className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500">Manage your account settings and preferences</p>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                  <div className="text-xs text-gray-500">Receive updates via email</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  className={`w-11 h-6 rounded-full transition-colors ${notifications.email ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications.email ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">SMS Notifications</div>
                  <div className="text-xs text-gray-500">Receive text message updates</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                  className={`w-11 h-6 rounded-full transition-colors ${notifications.sms ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications.sms ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">New Offers</div>
                  <div className="text-xs text-gray-500">Get notified when new offers arrive</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, offers: !notifications.offers })}
                  className={`w-11 h-6 rounded-full transition-colors ${notifications.offers ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications.offers ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Application Updates</div>
                  <div className="text-xs text-gray-500">Status changes and important updates</div>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, updates: !notifications.updates })}
                  className={`w-11 h-6 rounded-full transition-colors ${notifications.updates ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${notifications.updates ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-colors ${
                saving ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <SettingsContent />
    </Suspense>
  );
}
