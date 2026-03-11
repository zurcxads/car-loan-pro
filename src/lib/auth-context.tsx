"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'admin' | 'lender' | 'dealer' | 'consumer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  entityId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const DEMO_USERS: Array<AuthUser & { password: string }> = [
  { id: 'usr_admin_1', email: 'admin@autoloanpro.co', password: 'demo123', name: 'Admin User', role: 'admin', entityId: null },
  { id: 'usr_lender_1', email: 'lender@autoloanpro.co', password: 'demo123', name: 'Ally Financial', role: 'lender', entityId: 'LND-001' },
  { id: 'usr_dealer_1', email: 'dealer@autoloanpro.co', password: 'demo123', name: 'AutoMax Houston', role: 'dealer', entityId: 'DLR-001' },
  { id: 'usr_consumer_1', email: 'marcus.j@email.com', password: 'consumer123', name: 'Marcus Johnson', role: 'consumer', entityId: null },
];

const AUTH_KEY = 'clp_auth_user';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'Invalid email or password' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...authUser } = found;
    setUser(authUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
