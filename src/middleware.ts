import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { verifyDevAccessRequest } from '@/lib/dev-access';

function normalizeOrigin(origin: string | null) {
  if (!origin) return null;

  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: NextRequest) {
  const allowedOrigins = new Set<string>();
  const requestOrigin = normalizeOrigin(request.nextUrl.origin);
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? null);

  if (requestOrigin) {
    allowedOrigins.add(requestOrigin);
  }

  if (configuredOrigin) {
    allowedOrigins.add(configuredOrigin);
  }

  return allowedOrigins;
}

function isAllowedMutationRequest(request: NextRequest) {
  const allowedOrigins = getAllowedOrigins(request);
  const origin = normalizeOrigin(request.headers.get('origin'));
  const referer = normalizeOrigin(request.headers.get('referer'));

  if (origin && allowedOrigins.has(origin)) {
    return true;
  }

  if (!origin && referer && allowedOrigins.has(referer)) {
    return true;
  }

  // Allow requests with no Origin AND no Referer (server-to-server, same-origin navigations)
  // Browsers always send Origin on cross-origin POST/PUT/DELETE
  if (!origin && !referer) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  if (pathname.startsWith('/dev') && pathname !== '/dev/access' && !pathname.startsWith('/dev/access/')) {
    const devAccess = await verifyDevAccessRequest(request);
    if (!devAccess.valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/dev/access';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Rate limiting for application submissions (10 per hour per IP)
  if (pathname.startsWith('/api/applications') && request.method === 'POST') {
    const limit = checkRateLimit(`app:${ip}`, 10, 60 * 60 * 1000); // 10/hour
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many application submissions. Please try again later.',
          retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }
  }

  // Rate limiting for general API requests (100 per minute per IP)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    const limit = checkRateLimit(`api:${ip}`, 100, 60 * 1000); // 100/min
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please slow down.',
          retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }
  }

  if (
    pathname.startsWith('/api/')
    && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  ) {
    if (!isAllowedMutationRequest(request)) {
      return NextResponse.json(
        {
          error: 'Invalid request origin',
          success: false,
        },
        { status: 403 }
      );
    }
  }

  // Add security headers to all responses
  const response = await updateSession(request);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
