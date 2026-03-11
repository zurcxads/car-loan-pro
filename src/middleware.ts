import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Protected portal routes
  const protectedRoutes = {
    '/lender': 'lender',
    '/dealer': 'dealer',
    '/admin': 'admin',
  };

  // Check if accessing a protected route
  for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      // No token = redirect to login
      if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
      }

      // Wrong role = forbidden
      if (token.role !== requiredRole) {
        return NextResponse.json(
          { error: 'Forbidden - insufficient permissions' },
          { status: 403 }
        );
      }

      // Valid token + correct role = allow
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lender/:path*', '/dealer/:path*', '/admin/:path*'],
};
