export type AppEnv = 'development' | 'staging' | 'production';

import { DEV_ACCESS_HINT_COOKIE, DEV_FEATURE_FLAGS_COOKIE, parseDevFeatureFlags } from '@/lib/dev-access';

const APP_ENVS: AppEnv[] = ['development', 'staging', 'production'];

function isConfiguredAppEnv(value: string | undefined): value is AppEnv {
  return APP_ENVS.includes(value as AppEnv);
}

export function getAppEnv(): AppEnv {
  const value = process.env.NEXT_PUBLIC_APP_ENV;

  if (isConfiguredAppEnv(value)) {
    return value;
  }

  return process.env.NODE_ENV === 'development' ? 'development' : 'production';
}

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isStaging(): boolean {
  return getAppEnv() === 'staging';
}

export function isProduction(): boolean {
  return getAppEnv() === 'production';
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? cookie.slice(name.length + 1) : null;
}

export function isDevAccessGranted(): boolean {
  return getCookieValue(DEV_ACCESS_HINT_COOKIE) === '1';
}

export function showDevTools(): boolean {
  return isDevAccessGranted();
}

export function getClientDevFeatureFlags() {
  return parseDevFeatureFlags(getCookieValue(DEV_FEATURE_FLAGS_COOKIE));
}

export function useMockData(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const flags = getClientDevFeatureFlags();

  if (!(supabaseUrl && supabaseAnonKey)) {
    return true;
  }

  return isDevAccessGranted() && flags.mockData;
}
