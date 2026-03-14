"use client";

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';

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
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const badgeStyles: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900',
    red: 'text-red-600 bg-red-50 border border-red-200',
    green: 'text-green-600 bg-green-50 border border-green-200',
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-950">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
          <Link href="/" className="block"><Logo size="sm" /></Link>
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
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-l-2 border-blue-500'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          {userName && <div className="text-xs text-gray-500 dark:text-zinc-400 mb-2 truncate">{userName}</div>}
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-xs text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200 cursor-pointer text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl sticky top-0 z-30">
          <div className="px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{portalName}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-gray-400 dark:text-zinc-500">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
