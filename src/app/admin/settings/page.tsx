"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PlatformSettings {
  stipulation_rules: {
    fico_720_plus: { stips: string[]; auto_approve: boolean };
    fico_660_719: { stips: string[]; auto_approve: boolean };
    fico_580_659: { stips: string[]; auto_approve: boolean };
    fico_below_580: { stips: string[]; auto_approve: boolean };
  };
  application_settings: {
    min_loan_amount: number;
    max_loan_amount: number;
    min_fico: number;
    max_dti: number;
  };
  platform_settings: {
    maintenance_mode: boolean;
    registration_open: boolean;
    show_apr_ranges_homepage: boolean;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!data.error) {
        setSettings(data.settings);
      }
    } catch {
      toast.error('Failed to load settings');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Settings saved successfully');
      }
    } catch {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  const updateSetting = (category: keyof PlatformSettings, key: string, value: unknown) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold tracking-tight text-gray-900">
            Auto Loan Pro Admin
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="text-gray-500 hover:text-gray-900">Dashboard</Link>
            <Link href="/admin/review" className="text-gray-500 hover:text-gray-900">Review Queue</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Settings</h1>
            <p className="text-gray-500">Configure stipulation rules, application settings, and platform behavior</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Application Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Application Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Min Loan Amount ($)</label>
                <input
                  type="number"
                  value={settings.application_settings.min_loan_amount}
                  onChange={e => updateSetting('application_settings', 'min_loan_amount', Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Max Loan Amount ($)</label>
                <input
                  type="number"
                  value={settings.application_settings.max_loan_amount}
                  onChange={e => updateSetting('application_settings', 'max_loan_amount', Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Min FICO Score</label>
                <input
                  type="number"
                  value={settings.application_settings.min_fico}
                  onChange={e => updateSetting('application_settings', 'min_fico', Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium">Max DTI (%)</label>
                <input
                  type="number"
                  value={settings.application_settings.max_dti}
                  onChange={e => updateSetting('application_settings', 'max_dti', Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Platform Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.platform_settings.maintenance_mode}
                  onChange={e => updateSetting('platform_settings', 'maintenance_mode', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Maintenance Mode</div>
                  <div className="text-xs text-gray-500">Disable all user-facing features</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.platform_settings.registration_open}
                  onChange={e => updateSetting('platform_settings', 'registration_open', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Registration Open</div>
                  <div className="text-xs text-gray-500">Allow new users to register</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.platform_settings.show_apr_ranges_homepage}
                  onChange={e => updateSetting('platform_settings', 'show_apr_ranges_homepage', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Show APR Ranges on Homepage</div>
                  <div className="text-xs text-gray-500">Display sample rates to consumers</div>
                </div>
              </label>
            </div>
          </div>

          {/* Stipulation Rules */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Stipulation Rules</h2>
            <div className="space-y-6">
              {Object.entries(settings.stipulation_rules).map(([tier, config]) => (
                <div key={tier} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">{tier.replace(/_/g, ' ').toUpperCase()}</h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.auto_approve}
                        onChange={e => {
                          const updated = { ...settings.stipulation_rules };
                          updated[tier as keyof typeof updated].auto_approve = e.target.checked;
                          setSettings({ ...settings, stipulation_rules: updated });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-xs text-gray-600">Auto-approve</span>
                    </label>
                  </div>
                  <div className="text-xs text-gray-500">
                    Required stipulations: {config.stips.length > 0 ? config.stips.join(', ') : 'None'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
