import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

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
