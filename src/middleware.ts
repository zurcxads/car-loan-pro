import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based route protection
    if (path.startsWith('/lender') && token?.role !== 'lender' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }
    if (path.startsWith('/dealer') && token?.role !== 'dealer' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    // API route protection
    if (path.startsWith('/api/lenders') && token?.role !== 'lender' && token?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (path.startsWith('/api/dealers') && token?.role !== 'dealer' && token?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (path.startsWith('/api/admin') && token?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes - no auth needed
        if (
          path === '/' ||
          path === '/login' ||
          path.startsWith('/apply') ||
          path.startsWith('/offers') ||
          path.startsWith('/status') ||
          path.startsWith('/api/auth') ||
          path.startsWith('/api/applications') ||
          path.startsWith('/api/offers')
        ) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/lender/:path*',
    '/dealer/:path*',
    '/admin/:path*',
    '/api/lenders/:path*',
    '/api/dealers/:path*',
    '/api/admin/:path*',
  ],
};
