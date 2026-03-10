"use client";

import useSWR, { type SWRConfiguration } from 'swr';
import { useSession } from 'next-auth/react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('API error');
    const body = await res.json().catch(() => ({}));
    (error as Error & { status: number; info: unknown }).status = res.status;
    (error as Error & { info: unknown }).info = body;
    throw error;
  }
  const json = await res.json();
  return json.data ?? json;
};

const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  errorRetryCount: 2,
};

// ---------- Applications ----------

export function useApplications() {
  return useSWR('/api/applications', fetcher, defaultConfig);
}

export function useApplication(id: string | null) {
  return useSWR(id ? `/api/applications/${id}` : null, fetcher, defaultConfig);
}

// ---------- Offers ----------

export function useOffers(applicationId?: string) {
  const url = applicationId ? `/api/offers?applicationId=${applicationId}` : '/api/offers';
  return useSWR(url, fetcher, defaultConfig);
}

// ---------- Lenders ----------

export function useLenders() {
  return useSWR('/api/lenders', fetcher, defaultConfig);
}

export function useLender(id: string | null) {
  return useSWR(id ? `/api/lenders/${id}` : null, fetcher, defaultConfig);
}

// ---------- Dealers ----------

export function useDealers() {
  return useSWR('/api/dealers', fetcher, defaultConfig);
}

// ---------- Deals ----------

export function useDeals(dealerId?: string) {
  const url = dealerId ? `/api/deals?dealerId=${dealerId}` : '/api/deals';
  return useSWR(url, fetcher, defaultConfig);
}

// ---------- Admin Stats ----------

export function useAdminStats() {
  return useSWR('/api/admin/stats', fetcher, defaultConfig);
}

// ---------- Activity Events ----------

export function useActivityEvents() {
  return useSWR('/api/admin/stats?type=events', fetcher, defaultConfig);
}

// ---------- Auth Helpers ----------

export function useCurrentUser() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    role: session?.user?.role,
    entityId: (session?.user as { entityId?: string })?.entityId,
  };
}

// ---------- Mutation helpers ----------

export async function apiPost<T>(url: string, body: unknown): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Request failed' };
    return { data: json.data };
  } catch {
    return { error: 'Network error' };
  }
}

export async function apiPatch<T>(url: string, body: unknown): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Request failed' };
    return { data: json.data };
  } catch {
    return { error: 'Network error' };
  }
}
