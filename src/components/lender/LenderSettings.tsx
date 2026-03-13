"use client";

import { useState } from 'react';

export default function LenderSettings() {
  const [companyName, setCompanyName] = useState('First National Auto Finance');
  const [contactEmail, setContactEmail] = useState('ops@fnaf.com');
  const [contactPhone, setContactPhone] = useState('(800) 555-0199');
  const [webhookUrl, setWebhookUrl] = useState('https://api.fnaf.com/webhooks/autoloanpro');
  const [apiKey] = useState('alp_demo_xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);
  const [teamMembers] = useState([
    { name: 'Sarah Johnson', email: 'sarah@fnaf.com', role: 'Underwriter', status: 'active' },
    { name: 'Mike Chen', email: 'mike@fnaf.com', role: 'Operations Manager', status: 'active' },
  ]);
  const [saved, setSaved] = useState('');

  const save = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  const regenerateApiKey = () => {
    if (confirm('Regenerating your API key will invalidate the current key. This action cannot be undone. Continue?')) {
      alert('API key regenerated. Update your integration immediately.');
    }
  };

  const testWebhook = async () => {
    alert('Test webhook sent to ' + webhookUrl);
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Lender Profile */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Lender Profile</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Company Name</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">Contact Email</label>
              <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">Contact Phone</label>
              <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" />
            </div>
          </div>
        </div>
        <button onClick={() => save('profile')} className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {saved === 'profile' ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {/* API Integration */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">API Integration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">API Key (Read-Only)</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(apiKey)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-xl transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Use this key to authenticate API requests. Keep it secure.</p>
          </div>
          <button
            onClick={regenerateApiKey}
            className="px-4 py-2 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
          >
            Regenerate API Key
          </button>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Webhook Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Webhook URL</label>
            <input
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhooks/autoloanpro"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50"
            />
            <p className="text-xs text-gray-500 mt-2">
              We&apos;ll send POST requests to this URL for events you&apos;re subscribed to.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => save('webhook')} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
              {saved === 'webhook' ? 'Saved' : 'Save Webhook URL'}
            </button>
            <button
              onClick={testWebhook}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Team Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Name', 'Email', 'Role', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 text-[10px] text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 font-medium">{m.name}</td>
                  <td className="py-3 text-gray-500">{m.email}</td>
                  <td className="py-3 text-gray-700">{m.role}</td>
                  <td className="py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors">
          + Add Team Member
        </button>
      </div>
    </div>
  );
}
