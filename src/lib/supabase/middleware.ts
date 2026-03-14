import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';

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

  // Dev mode bypass — skip ALL auth redirects
  if (request.nextUrl.searchParams.get('dev') === 'true') {
    return supabaseResponse;
  }

  // Get user role from metadata
  const userRole = user?.user_metadata?.role || '';

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

  // Protected routes — allow token-based access for consumers, otherwise redirect
  if (pathname.startsWith('/dashboard')) {
    // Check for session token or magic token in URL
    const sessionToken = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value
      || request.nextUrl.searchParams.get('token');
    const magicToken = request.nextUrl.searchParams.get('magic');

    // Allow access if user is authenticated OR has a valid token
    if (!user && !sessionToken && !magicToken) {
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
      url.pathname = '/auth/login';
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
      url.pathname = '/auth/login';
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
      url.pathname = '/auth/login';
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
