import type { NextRequest } from 'next/server';

export const DEV_ACCESS_COOKIE = 'dev_access';
export const DEV_ACCESS_HINT_COOKIE = 'dev_access_hint';
export const DEV_FEATURE_FLAGS_COOKIE = 'dev_flags';
export const DEV_ACCESS_DURATION_MS = 24 * 60 * 60 * 1000;

export interface DevAccessPayload {
  exp: number;
  iat: number;
  v: 1;
}

export interface DevFeatureFlags {
  mockData: boolean;
  verboseLogging: boolean;
  apiInspector: boolean;
}

export interface DevAccessVerificationResult {
  expiresAt: string | null;
  payload: DevAccessPayload | null;
  valid: boolean;
}

export const DEFAULT_DEV_FEATURE_FLAGS: DevFeatureFlags = {
  apiInspector: true,
  mockData: false,
  verboseLogging: false,
};

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}

async function importSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign']
  );
}

async function signEncodedPayload(encodedPayload: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encodedPayload));
  return Buffer.from(signature).toString('hex');
}

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      accumulator[key] = value;
      return accumulator;
    }, {});
}

export function getDevAccessSecret(): string {
  return process.env.DEV_SECRET || process.env.NEXTAUTH_SECRET || 'dev-access-local-secret';
}

export function getDevAccessPin(): string {
  return process.env.DEV_ACCESS_PIN || '2026';
}

export function getDevAccessExpiryDate(now = Date.now()): Date {
  return new Date(now + DEV_ACCESS_DURATION_MS);
}

export function getDevCookieSettings(expiresAt: Date) {
  return {
    expires: expiresAt,
    httpOnly: true,
    maxAge: DEV_ACCESS_DURATION_MS / 1000,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}

export function getDevHintCookieSettings(expiresAt: Date) {
  return {
    expires: expiresAt,
    httpOnly: false,
    maxAge: DEV_ACCESS_DURATION_MS / 1000,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}

export async function createDevAccessToken(now = Date.now()): Promise<{ expiresAt: string; token: string }> {
  const payload: DevAccessPayload = {
    exp: now + DEV_ACCESS_DURATION_MS,
    iat: now,
    v: 1,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signEncodedPayload(encodedPayload, getDevAccessSecret());

  return {
    expiresAt: new Date(payload.exp).toISOString(),
    token: `${encodedPayload}.${signature}`,
  };
}

export async function verifyDevAccessToken(token: string | undefined, now = Date.now()): Promise<DevAccessVerificationResult> {
  if (!token) {
    return { expiresAt: null, payload: null, valid: false };
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return { expiresAt: null, payload: null, valid: false };
  }

  const expectedSignature = await signEncodedPayload(encodedPayload, getDevAccessSecret());
  if (!timingSafeEqual(signature, expectedSignature)) {
    return { expiresAt: null, payload: null, valid: false };
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as DevAccessPayload;
    if (payload.v !== 1 || typeof payload.exp !== 'number' || payload.exp <= now) {
      return { expiresAt: payload.exp ? new Date(payload.exp).toISOString() : null, payload: null, valid: false };
    }

    return {
      expiresAt: new Date(payload.exp).toISOString(),
      payload,
      valid: true,
    };
  } catch {
    return { expiresAt: null, payload: null, valid: false };
  }
}

export async function verifyDevAccessRequest(request: NextRequest): Promise<DevAccessVerificationResult> {
  return verifyDevAccessToken(request.cookies.get(DEV_ACCESS_COOKIE)?.value);
}

export function serializeDevFeatureFlags(flags: DevFeatureFlags): string {
  return encodeURIComponent(JSON.stringify(flags));
}

export function parseDevFeatureFlags(rawValue: string | undefined | null): DevFeatureFlags {
  if (!rawValue) {
    return DEFAULT_DEV_FEATURE_FLAGS;
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(rawValue)) as Partial<DevFeatureFlags>;
    return {
      apiInspector: decoded.apiInspector ?? DEFAULT_DEV_FEATURE_FLAGS.apiInspector,
      mockData: decoded.mockData ?? DEFAULT_DEV_FEATURE_FLAGS.mockData,
      verboseLogging: decoded.verboseLogging ?? DEFAULT_DEV_FEATURE_FLAGS.verboseLogging,
    };
  } catch {
    return DEFAULT_DEV_FEATURE_FLAGS;
  }
}

export function getDevFeatureFlagsFromCookieHeader(cookieHeader: string): DevFeatureFlags {
  const cookies = parseCookieHeader(cookieHeader);
  return parseDevFeatureFlags(cookies[DEV_FEATURE_FLAGS_COOKIE]);
}

export function hasDevAccessHint(cookieHeader: string): boolean {
  const cookies = parseCookieHeader(cookieHeader);
  return cookies[DEV_ACCESS_HINT_COOKIE] === '1';
}
