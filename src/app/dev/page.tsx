"use client";

import Link from 'next/link';

const pages = [
  { section: 'Consumer Flow', links: [
    { name: 'Homepage', path: '/' },
    { name: 'Apply (7-step form)', path: '/apply' },
    { name: 'Results (needs token)', path: '/results?token=demo' },
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
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h1 className="text-2xl font-bold">Auto Loan Pro — Dev Map</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">All pages and routes in the app. Click any to preview.</p>
        
        <div className="space-y-8">
          {pages.map((section) => (
            <div key={section.section}>
              <h2 className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">{section.section}</h2>
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

        <div className="mt-12 p-4 rounded-lg bg-gray-900 border border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Demo Logins</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-gray-500">
            <div><span className="text-gray-400">Admin:</span> admin@autoloanpro.co</div>
            <div><span className="text-gray-400">Lender:</span> demo@ally.com</div>
            <div><span className="text-gray-400">Dealer:</span> demo@dealer.com</div>
          </div>
          <p className="text-xs text-gray-600 mt-2">Password for all: AutoLoanPro2026!</p>
        </div>

        <p className="text-xs text-gray-700 mt-8 text-center">This page is only for development. Remove before production launch.</p>
      </div>
    </div>
  );
}
