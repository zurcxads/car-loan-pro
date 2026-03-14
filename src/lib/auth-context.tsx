"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isDev } from '@/lib/env';
import type { User } from '@supabase/supabase-js';

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
  supabaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

function mapSupabaseUser(user: User): AuthUser {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || '',
    name: meta.full_name || meta.name || user.email?.split('@')[0] || '',
    role: (meta.role as UserRole) || 'consumer',
    entityId: meta.entity_id || null,
  };
}

function checkDevMode(): boolean {
  return isDev();
}

const DEV_USERS: Record<string, AuthUser> = {
  '/admin': { id: 'dev-admin', email: 'admin@autoloanpro.co', name: 'Admin (Dev)', role: 'admin', entityId: null },
  '/lender': { id: 'dev-lender', email: 'demo@ally.com', name: 'Ally Financial (Dev)', role: 'lender', entityId: 'LND-001' },
  '/dealer': { id: 'dev-dealer', email: 'demo@dealer.com', name: 'AutoNation (Dev)', role: 'dealer', entityId: 'DLR-001' },
  '/dashboard': { id: 'dev-consumer', email: 'john@example.com', name: 'John Doe (Dev)', role: 'consumer', entityId: null },
};

function getInitialDevUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  if (!isDev()) return null;

  const roleCookie = document.cookie.split('; ').find(row => row.startsWith('alp_dev_role='));
  const role = roleCookie?.split('=')[1] as UserRole | undefined;
  if (role) {
    if (role === 'admin') return DEV_USERS['/admin'];
    if (role === 'lender') return DEV_USERS['/lender'];
    if (role === 'dealer') return DEV_USERS['/dealer'];
    return DEV_USERS['/dashboard'];
  }

  const path = window.location.pathname;
  const match = Object.entries(DEV_USERS).find(([prefix]) => path.startsWith(prefix));
  return match ? match[1] : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialDevUser] = useState<AuthUser | null>(() => getInitialDevUser());
  const [user, setUser] = useState<AuthUser | null>(initialDevUser);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!initialDevUser);

  useEffect(() => {
    // Dev mode already handled in initial state
    if (initialDevUser && checkDevMode()) {
      return;
    }

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        setSupabaseUser(u);
        setUser(mapSupabaseUser(u));
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUser(mapSupabaseUser(session.user));
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialDevUser]);

  const login = async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
