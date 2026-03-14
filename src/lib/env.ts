export type AppEnv = 'development' | 'staging' | 'production';

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

export function showDevTools(): boolean {
  return isDev();
}

export function useMockData(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return isDev() && !(supabaseUrl && supabaseAnonKey);
}
