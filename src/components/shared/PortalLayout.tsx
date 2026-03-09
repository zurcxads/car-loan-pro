"use client";

import { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface PortalLayoutProps {
  portalName: string;
  portalBadge: string;
  badgeColor: string;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userName?: string;
  children: React.ReactNode;
  sidebarDark?: boolean;
}

export default function PortalLayout({
  portalName,
  portalBadge,
  badgeColor,
  navItems,
  activeTab,
  onTabChange,
  onLogout,
  userName,
  children,
  sidebarDark = false,
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarBg = sidebarDark ? 'bg-slate-900' : 'bg-[#0c0c0e]';
  const badgeStyles: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-600/10',
    red: 'text-red-400 bg-red-500/10 border border-red-500/20',
    green: 'text-green-400 bg-green-500/10',
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 ${sidebarBg} border-r border-white/10 flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-lg font-semibold tracking-tight block">Car Loan Pro</Link>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wider mt-2 inline-block ${badgeStyles[badgeColor] || badgeStyles.blue}`}>
            {portalBadge}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { onTabChange(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer ${
                activeTab === item.key
                  ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500'
                  : 'text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800/50'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {userName && <div className="text-xs text-zinc-500 mb-2 truncate">{userName}</div>}
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-xs text-zinc-500 hover:text-zinc-50 rounded-lg hover:bg-zinc-800/50 transition-colors duration-200 cursor-pointer text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="border-b border-white/10 bg-[#09090B]/90 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-50 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-sm font-semibold">{portalName}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-600">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
