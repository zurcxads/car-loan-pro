"use client";

import { useState } from 'react';
import { ROUTING_CONFIG, FEATURE_FLAGS, CREDIT_PULL_PROVIDER } from '@/lib/config';

export default function SystemSettings() {
  const [routing, setRouting] = useState(ROUTING_CONFIG);
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [provider, setProvider] = useState(CREDIT_PULL_PROVIDER.provider);
  const [saved, setSaved] = useState('');

  const featureFlagList = Object.entries(flags).map(([key, value]) => ({
    key,
    name: key.replace(/_/g, ' '),
    description: {
      ITIN_BORROWERS: 'Allow ITIN borrowers to apply',
      CO_BORROWER_FLOW: 'Enable co-borrower application flow',
      PLAID_INCOME: 'Use Plaid for income verification',
      PRIVATE_PARTY: 'Accept private party transactions',
      GAP_PRODUCTS: 'Offer GAP insurance products',
      SPANISH_LOCALE: 'Enable Spanish language support',
      DEALER_NOTIFICATIONS: 'Send dealer notifications',
      EMAIL_OFFERS: 'Email offer notifications to borrowers',
    }[key] || '',
    enabled: value,
  }));

  const save = (section: string) => {
    setSaved(section);
    localStorage.setItem('clp_system_settings', JSON.stringify({ routing, flags, provider }));
    setTimeout(() => setSaved(''), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div className={`w-11 h-6 rounded-full cursor-pointer ${value ? 'bg-blue-600' : 'bg-gray-200'}`} onClick={() => onChange(!value)}>
      <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-1'}`} />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-8">
      {/* Routing Config */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Routing Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Max Lenders per Submission</label>
            <input type="number" value={routing.maxLendersPerSubmission} onChange={e => setRouting(r => ({ ...r, maxLendersPerSubmission: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Submission Delay (ms)</label>
            <input type="number" value={routing.submissionDelayMs} onChange={e => setRouting(r => ({ ...r, submissionDelayMs: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Retry on Timeout</span>
            <Toggle value={routing.retryOnTimeout} onChange={(v) => setRouting(r => ({ ...r, retryOnTimeout: v }))} />
          </div>
          {routing.retryOnTimeout && (
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">Retry Count</label>
              <input type="number" value={routing.retryCount} onChange={e => setRouting(r => ({ ...r, retryCount: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
            </div>
          )}
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Offer Expiration Default (days)</label>
            <input type="number" value={routing.offerExpirationDays} onChange={e => setRouting(r => ({ ...r, offerExpirationDays: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
          </div>
        </div>
        <button onClick={() => save('routing')} className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {saved === 'routing' ? 'Saved' : 'Save Routing Config'}
        </button>
      </div>

      {/* Credit Pull Provider */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Credit Pull Provider</h3>
        <div className="space-y-3">
          {(['mock', '700credit', 'experian_connect'] as const).map(p => (
            <label key={p} className="flex items-center gap-3 cursor-pointer" onClick={() => setProvider(p)}>
              <div className={`w-4 h-4 rounded-full border-2 ${provider === p ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                {provider === p && <div className="w-2 h-2 rounded-full bg-white m-0.5" />}
              </div>
              <span className="text-sm text-gray-700">
                {p === 'mock' ? 'Mock / Sandbox' : p === '700credit' ? '700Credit' : 'Experian Connect'}
              </span>
            </label>
          ))}
        </div>
        <button onClick={() => save('provider')} className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {saved === 'provider' ? 'Saved' : 'Save Provider'}
        </button>
      </div>

      {/* Feature Flags */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Feature Flags</h3>
        <div className="space-y-3">
          {featureFlagList.map(flag => (
            <div key={flag.key} className="flex items-center justify-between py-2 border-b border-gray-200">
              <div>
                <div className="text-sm text-gray-700">{flag.name}</div>
                <div className="text-[10px] text-gray-500">{flag.description}</div>
              </div>
              <Toggle
                value={flag.enabled}
                onChange={(v) => setFlags(f => ({ ...f, [flag.key]: v }))}
              />
            </div>
          ))}
        </div>
        <button onClick={() => save('flags')} className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {saved === 'flags' ? 'Saved' : 'Save Feature Flags'}
        </button>
      </div>

      {/* Email Templates */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Email Templates</h3>
        <div className="space-y-2">
          {['Offer Available', 'Status Update', 'Document Request', 'Adverse Action', 'Welcome'].map(template => (
            <div key={template} className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-sm text-gray-700">{template}</span>
              <button className="text-xs text-blue-600 hover:text-blue-500 cursor-pointer">Edit Template</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
