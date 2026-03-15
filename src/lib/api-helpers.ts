import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase';

const PROTECTED_DEMO_EMAILS = new Set([
  'admin@autoloanpro.co',
  'demo@ally.com',
  'demo@dealer.com',
]);

export const MAX_JSON_BODY_BYTES = 100 * 1024;

type AuthenticatedUser = {
  email: string;
  entityId: string | null;
  id: string;
  name: string;
  role: string;
};

type AuthResult = {
  session: { user: AuthenticatedUser } | null;
  error: NextResponse | null;
};

// Standard API response helpers
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function apiValidationError(error: z.ZodError) {
  const issues = error.issues ?? [];
  const formatted = issues.map((e) => ({
    field: e.path.map(String).join('.'),
    message: e.message,
  }));
  return NextResponse.json(
    { success: false, error: 'Validation failed', details: formatted },
    { status: 422 }
  );
}

function normalizeSessionUser(user: { role: string; id: string; email?: string | null; name?: string | null; entityId?: string | null }): AuthenticatedUser | null {
  const normalizedEmail = user.email?.toLowerCase() || '';

  if (PROTECTED_DEMO_EMAILS.has(normalizedEmail)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.name || '',
    role: user.role || 'consumer',
    entityId: user.entityId || null,
  };
}

async function resolveAuth(requiredRole?: string, allowAnonymous = false): Promise<AuthResult> {
  if (await isServerDevAccessGranted()) {
    const role = requiredRole === 'dealer' || requiredRole === 'lender' || requiredRole === 'admin'
      ? requiredRole
      : 'admin';

    return {
      session: {
        user: {
          email: role === 'admin' ? 'admin@autoloanpro.co' : role === 'dealer' ? 'demo@dealer.com' : 'demo@ally.com',
          entityId: role === 'dealer' ? 'DLR-001' : role === 'lender' ? 'LND-001' : null,
          id: `dev-${role}`,
          name: role === 'admin' ? 'Admin (Dev)' : role === 'dealer' ? 'Dealer (Dev)' : 'Lender (Dev)',
          role,
        }
      },
      error: null,
    };
  }

  const session = await getServerAuthSession();
  if (!session?.user) {
    return allowAnonymous
      ? { session: null, error: null }
      : { session: null, error: apiError('Unauthorized', 401) };
  }

  const normalizedUser = normalizeSessionUser(session.user);
  if (!normalizedUser) {
    return allowAnonymous
      ? { session: null, error: null }
      : { session: null, error: apiError('Unauthorized', 401) };
  }

  if (requiredRole && normalizedUser.role !== requiredRole && normalizedUser.role !== 'admin') {
    return { session: null, error: apiError('Forbidden', 403) };
  }

  return {
    session: {
      user: normalizedUser,
    },
    error: null,
  };
}

export async function getServerAuthSession(): Promise<{ user: AuthenticatedUser } | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const metadata = user.user_metadata ?? {};
    const normalizedUser = normalizeSessionUser({
      id: user.id,
      email: user.email ?? '',
      name: typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
          ? metadata.name
          : user.email?.split('@')[0] ?? '',
      role: typeof metadata.role === 'string' ? metadata.role : 'consumer',
      entityId: typeof metadata.entity_id === 'string' ? metadata.entity_id : null,
    });

    if (!normalizedUser) {
      return null;
    }

    return { user: normalizedUser };
  } catch {
    return null;
  }
}

// Parse and validate request body
export async function parseBody<T>(req: NextRequest, schema: z.ZodType<T>): Promise<{ data: T | null; error: NextResponse | null }> {
  const contentLength = req.headers.get('content-length');
  if (contentLength) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_JSON_BODY_BYTES) {
      return { data: null, error: apiError('Request too large', 413) };
    }
  }

  try {
    const rawBody = await req.text();
    const bodySize = new TextEncoder().encode(rawBody).length;
    if (bodySize > MAX_JSON_BODY_BYTES) {
      return { data: null, error: apiError('Request too large', 413) };
    }

    const body = JSON.parse(rawBody) as unknown;
    const result = schema.safeParse(body);
    if (!result.success) {
      return { data: null, error: apiValidationError(result.error) };
    }
    return { data: result.data, error: null };
  } catch {
    return { data: null, error: apiError('Invalid JSON body', 400) };
  }
}

export async function requireAuth(requiredRole?: string) {
  return resolveAuth(requiredRole, false);
}

export async function getOptionalAuth(requiredRole?: string) {
  return resolveAuth(requiredRole, true);
}

export function getConsumerSessionToken(req: NextRequest): string | null {
  return req.cookies.get('consumer_session')?.value
    || req.cookies.get(CONSUMER_SESSION_COOKIE)?.value
    || null;
}

// Extract query params
export function getSearchParams(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}
