"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DevModeContextType {
  isDevMode: boolean;
  currentRole: 'consumer' | 'lender' | 'dealer' | 'admin' | null;
  setRole: (role: 'consumer' | 'lender' | 'dealer' | 'admin' | null) => void;
  enableDevMode: () => void;
  disableDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(false);
  const [currentRole, setCurrentRole] = useState<'consumer' | 'lender' | 'dealer' | 'admin' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL param
    const urlParams = new URLSearchParams(window.location.search);
    const devParam = urlParams.get('dev');

    // Check cookie
    const devCookie = document.cookie.split('; ').find(row => row.startsWith('alp_dev_mode='));
    const hasDevCookie = devCookie?.split('=')[1] === 'true';

    const shouldEnableDevMode = devParam === 'true' || hasDevCookie;

    if (shouldEnableDevMode) {
      setIsDevMode(true);

      // Set cookie if not already set
      if (!hasDevCookie) {
        document.cookie = 'alp_dev_mode=true; path=/; max-age=86400'; // 24 hours
      }

      // Check for role in cookie
      const roleCookie = document.cookie.split('; ').find(row => row.startsWith('alp_dev_role='));
      if (roleCookie) {
        const role = roleCookie.split('=')[1] as 'consumer' | 'lender' | 'dealer' | 'admin';
        setCurrentRole(role);
      }
    }
  }, []);

  const setRole = (role: 'consumer' | 'lender' | 'dealer' | 'admin' | null) => {
    setCurrentRole(role);
    if (role) {
      document.cookie = `alp_dev_role=${role}; path=/; max-age=86400`;
    } else {
      document.cookie = 'alp_dev_role=; path=/; max-age=0';
    }
  };

  const enableDevMode = () => {
    setIsDevMode(true);
    document.cookie = 'alp_dev_mode=true; path=/; max-age=86400';
  };

  const disableDevMode = () => {
    setIsDevMode(false);
    setCurrentRole(null);
    document.cookie = 'alp_dev_mode=; path=/; max-age=0';
    document.cookie = 'alp_dev_role=; path=/; max-age=0';
  };

  return (
    <DevModeContext.Provider value={{ isDevMode, currentRole, setRole, enableDevMode, disableDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevModeProvider');
  }
  return context;
}
