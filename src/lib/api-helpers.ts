import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

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

// Get authenticated session with role check
export async function requireAuth(requiredRole?: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Read-only in API routes
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { session: null, user: null, error: apiError('Unauthorized', 401) };
  }

  const meta = user.user_metadata || {};
  const role = meta.role || 'consumer';

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return { session: null, user: null, error: apiError('Forbidden', 403) };
  }

  return {
    session: { user: { id: user.id, email: user.email, name: meta.name || meta.full_name, role, entityId: meta.entity_id } },
    user,
    error: null,
  };
}

// Extract query params
export function getSearchParams(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}
