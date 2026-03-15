import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import { verifyDevAccessRequest } from '@/lib/dev-access';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dev') && pathname !== '/dev/access' && !pathname.startsWith('/dev/access/')) {
    const devAccess = await verifyDevAccessRequest(request);
    if (!devAccess.valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/dev/access';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Get user role from metadata
  const userRole = user?.user_metadata?.role || '';
  const isAdminLogin = pathname === '/admin/login';
  const isLenderLogin = pathname === '/lender/login';
  const isDealerLogin = pathname === '/dealer/login';

  // Auth pages — redirect to home if already authenticated
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (user) {
      const url = request.nextUrl.clone();
      if (userRole === 'admin') {
        url.pathname = '/admin';
      } else if (userRole === 'lender') {
        url.pathname = '/lender';
      } else if (userRole === 'dealer') {
        url.pathname = '/dealer';
      } else {
        url.pathname = '/dashboard';
      }
      return NextResponse.redirect(url);
    }
  }

  // Portal login pages stay public, but authenticated users should land in their portal.
  if (isAdminLogin || isLenderLogin || isDealerLogin) {
    if (user) {
      const url = request.nextUrl.clone();

      if (isAdminLogin) {
        url.pathname = userRole === 'admin' ? '/admin' : '/';
      } else if (isLenderLogin) {
        url.pathname = userRole === 'lender' || userRole === 'admin' ? '/lender' : '/';
      } else {
        url.pathname = userRole === 'dealer' || userRole === 'admin' ? '/dealer' : '/';
      }

      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // Protected routes — allow token-based access for consumers, otherwise redirect
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value;

    if (!user && !sessionToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Results page — allow token-based access (no auth required)
  if (pathname.startsWith('/results')) {
    // Results page is accessible via session token, no redirect needed
    return supabaseResponse;
  }

  // Offers page — allow token-based access (no auth required)
  if (pathname.startsWith('/offers')) {
    // Offers page is accessible via session token, no redirect needed
    return supabaseResponse;
  }

  // Admin portal — requires admin role
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    if (userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Lender portal — requires lender role
  if (pathname.startsWith('/lender')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/lender/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    if (userRole !== 'lender' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Dealer portal — requires dealer role
  if (pathname.startsWith('/dealer')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dealer/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    if (userRole !== 'dealer' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
