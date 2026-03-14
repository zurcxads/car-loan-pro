"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { showDevTools } from '@/lib/env';

interface DevModeContextType {
  isDevMode: boolean;
  currentRole: 'consumer' | 'lender' | 'dealer' | 'admin' | null;
  setRole: (role: 'consumer' | 'lender' | 'dealer' | 'admin' | null) => void;
  enableDevMode: () => void;
  disableDevMode: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(showDevTools());
  const [currentRole, setCurrentRole] = useState<'consumer' | 'lender' | 'dealer' | 'admin' | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !showDevTools()) return;

    const roleCookie = document.cookie.split('; ').find(row => row.startsWith('alp_dev_role='));
    if (roleCookie) {
      const role = roleCookie.split('=')[1] as 'consumer' | 'lender' | 'dealer' | 'admin';
      setCurrentRole(role);
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
    setIsDevMode(showDevTools());
  };

  const disableDevMode = () => {
    setIsDevMode(showDevTools());
    setCurrentRole(null);
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
