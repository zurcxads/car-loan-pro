import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicToken } from '@/lib/magic-link';

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

    // Generate a new session token for this magic link access
    const sessionToken = crypto.randomUUID();

    // Store the session in localStorage via URL param (the dashboard will handle it)
    const dashboardUrl = `${BASE_URL}/dashboard?magic=${sessionToken}&app_id=${result.applicationId}`;

    return NextResponse.redirect(dashboardUrl);
  } catch (err) {
    console.error('Magic link verification error:', err);
    return NextResponse.redirect(`${BASE_URL}/login?error=verification_failed`);
  }
}
