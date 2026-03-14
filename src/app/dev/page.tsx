"use client";

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Car, Wrench, User, Building, Store, Settings, Palette, Plug, FileText } from 'lucide-react';

const pages = [
  { section: 'Consumer Flow', links: [
    { name: 'Homepage', path: '/' },
    { name: 'Apply (7-step form)', path: '/apply' },
    { name: 'Results (dev preview)', path: '/results?dev=true' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Dashboard — Offers', path: '/dashboard/offers' },
    { name: 'Dashboard — Status', path: '/dashboard/status' },
    { name: 'Dashboard — Documents', path: '/dashboard/documents' },
    { name: 'Dashboard — Settings', path: '/dashboard/settings' },
    { name: 'Dashboard — Approval Letter', path: '/dashboard/approval-letter' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Referral', path: '/referral' },
  ]},
  { section: 'Portals', links: [
    { name: 'Lender Portal', path: '/lender' },
    { name: 'Dealer Portal', path: '/dealer' },
    { name: 'Admin Panel', path: '/admin' },
    { name: 'Admin — Review Queue', path: '/admin/review' },
    { name: 'Admin — Analytics', path: '/admin/analytics' },
    { name: 'Admin — Settings', path: '/admin/settings' },
    { name: 'Admin — Email Templates', path: '/admin/email-templates' },
  ]},
  { section: 'Auth', links: [
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/auth/register' },
    { name: 'Forgot Password', path: '/auth/forgot-password' },
  ]},
  { section: 'Info Pages', links: [
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Resources / Blog', path: '/resources' },
    { name: 'API Documentation', path: '/api-docs' },
  ]},
  { section: 'Legal / Disclosures', links: [
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Disclosures Hub', path: '/disclosures' },
    { name: 'FCRA Notice', path: '/disclosures/fcra' },
    { name: 'ECOA Notice', path: '/disclosures/ecoa' },
    { name: 'Advertising Disclosures', path: '/disclosures/advertising' },
    { name: 'State Disclosures', path: '/disclosures/state' },
  ]},
];

export default function DevPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const createTestApp = async (withVehicle: boolean) => {
    setCreating(true);
    try {
      const response = await fetch('/api/dev/create-test-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withVehicle }),
      });

      if (!response.ok) throw new Error('Failed to create test application');

      await response.json();
      toast.success(`Test application created!`);

      setTimeout(() => {
        router.push('/results');
      }, 1000);
    } catch (error) {
      toast.error('Failed to create test application');
      console.error(error);
      setCreating(false);
    }
  };

  const quickActions = [
    {
      Icon: Car,
      label: 'Create Test Application',
      description: 'Pre-approval only (no vehicle)',
      onClick: () => createTestApp(false),
      color: 'blue',
    },
    {
      Icon: Wrench,
      label: 'Create Test Application (with vehicle)',
      description: 'Full application with vehicle data',
      onClick: () => createTestApp(true),
      color: 'green',
    },
    {
      Icon: User,
      label: 'View as Consumer',
      description: 'Opens consumer dashboard',
      onClick: () => {
        document.cookie = 'alp_dev_role=consumer; path=/; max-age=86400';
        router.push('/dashboard');
      },
      color: 'purple',
    },
    {
      Icon: Building,
      label: 'View as Lender',
      description: 'Opens lender portal',
      onClick: () => {
        document.cookie = 'alp_dev_role=lender; path=/; max-age=86400';
        router.push('/lender');
      },
      color: 'orange',
    },
    {
      Icon: Store,
      label: 'View as Dealer',
      description: 'Opens dealer portal',
      onClick: () => {
        document.cookie = 'alp_dev_role=dealer; path=/; max-age=86400';
        router.push('/dealer');
      },
      color: 'teal',
    },
    {
      Icon: Settings,
      label: 'View as Admin',
      description: 'Opens admin panel',
      onClick: () => {
        document.cookie = 'alp_dev_role=admin; path=/; max-age=86400';
        router.push('/admin');
      },
      color: 'red',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-3xl font-bold">Auto Loan Pro — Developer Dashboard</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Dev mode tools, quick actions, and complete sitemap. Enable dev mode with ?dev=true
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                disabled={creating}
                className={`group relative overflow-hidden bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:border-${action.color}-600 hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-4">
                  <action.Icon className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-${action.color}-400 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-${action.color}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200`} />
              </button>
            ))}
          </div>
        </div>

        {/* Dev Tools */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">Dev Tools</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/dev/components"
              className="flex items-center gap-3 px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-600 hover:bg-gray-800 transition-all duration-200"
            >
              <Palette className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Component Gallery</h3>
                <p className="text-xs text-gray-400">Preview all UI components</p>
              </div>
            </Link>
            <Link
              href="/dev/api"
              className="flex items-center gap-3 px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-600 hover:bg-gray-800 transition-all duration-200"
            >
              <Plug className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">API Explorer</h3>
                <p className="text-xs text-gray-400">Test API endpoints</p>
              </div>
            </Link>
            <button
              onClick={() => {
                router.push('/apply?dev=true');
              }}
              className="flex items-center gap-3 px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-600 hover:bg-gray-800 transition-all duration-200 text-left"
            >
              <FileText className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Test Apply Form</h3>
                <p className="text-xs text-gray-400">Pre-filled with test data</p>
              </div>
            </button>
          </div>
        </div>

        {/* All Pages */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">All Pages</h2>
          <div className="space-y-8">
            {pages.map((section) => (
              <div key={section.section}>
                <h3 className="text-xs uppercase tracking-wider text-gray-600 font-medium mb-3">{section.section}</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {section.links.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-blue-600 hover:bg-gray-800 transition-all duration-200 group"
                    >
                      <span className="text-sm text-gray-300 group-hover:text-white">{link.name}</span>
                      <span className="text-xs text-gray-600 group-hover:text-blue-400 font-mono">{link.path}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Data */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-4">Test Data</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Demo Accounts</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Consumer</div>
                <div className="text-sm text-gray-300 font-mono">maria.rodriguez.test@autoloanpro.co</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Lender</div>
                <div className="text-sm text-gray-300 font-mono">demo@ally.com</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Dealer</div>
                <div className="text-sm text-gray-300 font-mono">demo@dealer.com</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Admin</div>
                <div className="text-sm text-gray-300 font-mono">admin@autoloanpro.co</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="text-xs text-gray-500">Password for all accounts</div>
              <div className="text-sm text-gray-300 font-mono mt-1">AutoLoanPro2026!</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            This page is only for development. Remove before production launch.
          </p>
        </div>
      </div>
    </div>
  );
}
