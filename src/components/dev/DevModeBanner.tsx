"use client";

import { useDevMode } from '@/contexts/DevModeContext';
import { useState } from 'react';
import { User, Car, Building, Store, Settings } from 'lucide-react';
import { showDevTools } from '@/lib/env';

export default function DevModeBanner() {
  const { isDevMode, currentRole, setRole, disableDevMode } = useDevMode();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  if (!showDevTools() || !isDevMode) return null;

  const roles = [
    { value: null, label: 'No Role (Guest)', icon: User },
    { value: 'consumer' as const, label: 'Consumer', icon: Car },
    { value: 'lender' as const, label: 'Lender', icon: Building },
    { value: 'dealer' as const, label: 'Dealer', icon: Store },
    { value: 'admin' as const, label: 'Admin', icon: Settings },
  ];

  const currentRoleData = roles.find(r => r.value === currentRole) || roles[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-400 text-gray-900 px-4 py-2 flex items-center justify-between shadow-lg border-b-2 border-yellow-500">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          <span className="text-sm font-bold tracking-wide">DEV MODE</span>
        </div>

        <div className="h-4 w-px bg-yellow-600" />

        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-sm font-medium transition-colors"
          >
            <currentRoleData.icon className="w-4 h-4" />
            <span>{currentRoleData.label}</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                {roles.map(role => (
                  <button
                    key={role.label}
                    onClick={() => {
                      setRole(role.value);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      currentRole === role.value ? 'bg-yellow-50 text-yellow-900 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <role.icon className="w-4 h-4" />
                    <span>{role.label}</span>
                    {currentRole === role.value && (
                      <svg className="w-4 h-4 ml-auto text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-yellow-900">
          <span>Auth bypassed</span>
          <span>•</span>
          <span>Validation relaxed</span>
          <span>•</span>
          <span>Auto-fill enabled</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/dev"
          className="text-xs font-medium text-yellow-900 hover:text-yellow-950 underline"
        >
          Dev Dashboard
        </a>
        <button
          onClick={disableDevMode}
          className="text-xs font-medium text-red-700 hover:text-red-900 underline"
        >
          Clear Dev Role
        </button>
      </div>
    </div>
  );
}
