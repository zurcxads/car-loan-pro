import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken } from '@/lib/magic-link';
import { dbGetApplication } from '@/lib/db';
import {
  CONSUMER_SESSION_COOKIE,
  getConsumerSessionCookieOptions,
} from '@/lib/consumer-session';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * GET /api/auth/magic-link/verify?token=xxx
 * Verify magic link token and redirect to dashboard
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${BASE_URL}/login?error=invalid_token`);
    }

    // Verify the token
    const result = await verifyMagicToken(token);

    if (!result) {
      return NextResponse.redirect(`${BASE_URL}/login?error=expired_token`);
    }

    const application = await dbGetApplication(result.applicationId);
    const sessionToken = (application as { sessionToken?: string } | null)?.sessionToken;

    if (!sessionToken) {
      return NextResponse.redirect(`${BASE_URL}/login?error=session_unavailable`);
    }

    const response = NextResponse.redirect(`${BASE_URL}/dashboard`);
    response.cookies.set(
      CONSUMER_SESSION_COOKIE,
      sessionToken,
      getConsumerSessionCookieOptions()
    );

    return response;
  } catch (err) {
    console.error('Magic link verification error:', err);
    return NextResponse.redirect(`${BASE_URL}/login?error=verification_failed`);
  }
}
