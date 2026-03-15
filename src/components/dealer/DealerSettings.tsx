"use client";

import { useEffect, useState } from 'react';
import { MOCK_DEALERS, type MockDealer } from '@/lib/mock-data';

export default function DealerSettings() {
  const [dealers, setDealers] = useState<MockDealer[]>(MOCK_DEALERS);
  const fallbackDealer = dealers[0] ?? MOCK_DEALERS[0];
  const [dealer, setDealer] = useState(MOCK_DEALERS[0]);
  const [name, setName] = useState(MOCK_DEALERS[0].name);
  const [address, setAddress] = useState(MOCK_DEALERS[0].address);
  const [city, setCity] = useState(MOCK_DEALERS[0].city);
  const [state, setState] = useState(MOCK_DEALERS[0].state);
  const [zip, setZip] = useState(MOCK_DEALERS[0].zip);
  const [phone, setPhone] = useState(MOCK_DEALERS[0].phone);
  const [website, setWebsite] = useState(MOCK_DEALERS[0].website);
  const [teamMembers, setTeamMembers] = useState(MOCK_DEALERS[0].teamMembers);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState<'daily' | 'weekly' | 'off'>('daily');
  const [smsPhone, setSmsPhone] = useState(MOCK_DEALERS[0].phone);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const response = await fetch('/api/dealers/settings');
        const json = (await response.json()) as {
          success?: boolean;
          data?: {
            dealer?: MockDealer;
            notifications?: {
              smsAlerts?: boolean;
              emailDigest?: 'daily' | 'weekly' | 'off';
              smsPhone?: string;
            };
          };
        };

        if (mounted && json.success && json.data?.dealer) {
          setDealers([json.data.dealer]);
          setSmsAlerts(json.data.notifications?.smsAlerts ?? true);
          setEmailDigest(json.data.notifications?.emailDigest ?? 'daily');
          setSmsPhone(json.data.notifications?.smsPhone ?? json.data.dealer.phone);
        }
      } catch {}
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setDealer(fallbackDealer);
    setName(fallbackDealer.name);
    setAddress(fallbackDealer.address);
    setCity(fallbackDealer.city);
    setState(fallbackDealer.state);
    setZip(fallbackDealer.zip);
    setPhone(fallbackDealer.phone);
    setWebsite(fallbackDealer.website);
    setTeamMembers(fallbackDealer.teamMembers);
  }, [fallbackDealer]);

  const save = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div className={`w-11 h-6 rounded-full cursor-pointer ${value ? 'bg-blue-600' : 'bg-gray-200'}`} onClick={() => onChange(!value)}>
      <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-1'}`} />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-8">
      {/* Dealership Info */}
      <div className="rounded-2xl bg-white  border border-gray-200  shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Dealership Information</h3>
        <div className="space-y-3">
          <div><label className="text-[10px] text-gray-500 mb-1 block">Dealership Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
          <div><label className="text-[10px] text-gray-500 mb-1 block">Address</label><input value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-[10px] text-gray-500 mb-1 block">City</label><input value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">State</label><input value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">ZIP</label><input value={zip} onChange={e => setZip(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[10px] text-gray-500 mb-1 block">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
            <div><label className="text-[10px] text-gray-500 mb-1 block">Website</label><input value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
          </div>
        </div>
        <button onClick={() => save('info')} className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {saved === 'info' ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Team Members */}
      <div className="rounded-2xl bg-white  border border-gray-200  shadow-sm p-8">
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
                  <td className="py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl bg-white  border border-gray-200  shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">SMS alerts for new buyers</span>
            <Toggle value={smsAlerts} onChange={setSmsAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email digest</span>
            <select value={emailDigest} onChange={e => setEmailDigest(e.target.value as 'daily' | 'weekly' | 'off')} className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none cursor-pointer">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="off">Off</option>
            </select>
          </div>
          {smsAlerts && (
            <div><label className="text-[10px] text-gray-500 mb-1 block">SMS Phone</label><input value={smsPhone} onChange={e => setSmsPhone(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-600/50" /></div>
          )}
        </div>
        <button onClick={() => save('notif')} className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors cursor-pointer">
          {saved === 'notif' ? 'Saved' : 'Save Notification Settings'}
        </button>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl bg-white  border border-gray-200  shadow-sm p-8">
        <h3 className="text-sm font-semibold mb-6">Subscription</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-[10px] text-gray-500 block">Current Plan</span><span className="font-semibold text-blue-600">{dealer.plan} ${dealer.planPrice}/mo</span></div>
          <div><span className="text-[10px] text-gray-500 block">Billing Date</span><span className="font-medium">{dealer.billingDate}</span></div>
          <div><span className="text-[10px] text-gray-500 block">Next Renewal</span><span className="font-medium">Apr 15, 2026</span></div>
          <div><span className="text-[10px] text-gray-500 block">Payment Method</span><span className="font-medium">**** 4242</span></div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer">Change Plan</button>
          <button className="px-4 py-2 text-xs border border-gray-200 hover:border-gray-300 rounded-lg transition-colors cursor-pointer">Update Payment</button>
        </div>
      </div>
    </div>
  );
}
