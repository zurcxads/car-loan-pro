import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

// Parse and validate request body
export async function parseBody<T>(req: NextRequest, schema: z.ZodType<T>): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return { data: null, error: apiValidationError(result.error) };
    }
    return { data: result.data, error: null };
  } catch {
    return { data: null, error: apiError('Invalid JSON body', 400) };
  }
}

// Get authenticated session with role check using NextAuth
export async function requireAuth(requiredRole?: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { session: null, error: apiError('Unauthorized', 401) };
  }

  const user = session.user as { role: string; id: string; email?: string | null; name?: string | null; entityId?: string | null };
  const role = user.role || 'consumer';

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return { session: null, error: apiError('Forbidden', 403) };
  }

  return {
    session: {
      user: {
        id: user.id,
        email: user.email || '',
        name: user.name || '',
        role,
        entityId: user.entityId || null,
      }
    },
    error: null,
  };
}

// Extract query params
export function getSearchParams(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}
