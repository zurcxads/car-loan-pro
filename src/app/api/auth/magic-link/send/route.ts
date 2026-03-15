import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { generateMagicToken } from '@/lib/magic-link';
import { magicLinkEmail, sendEmail } from '@/lib/email-templates';
import { serverLogger } from '@/lib/server-logger';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * POST /api/auth/magic-link/send
 * Send a magic link to a user's email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, applicationId, firstName } = body;

    if (!email || !applicationId) {
      return apiError('Email and application ID are required', 400);
    }

    // Generate magic token
    const { token, error } = await generateMagicToken(email, applicationId);
    if (error || !token) {
      return apiError(error || 'Failed to generate magic link', 500);
    }

    // Create magic link URL
    const magicLinkUrl = `${BASE_URL}/api/auth/magic-link/verify?token=${token}`;

    // Send email
    const emailData = magicLinkEmail(
      email,
      firstName || 'there',
      magicLinkUrl
    );

    const { success, error: sendError } = await sendEmail(emailData);
    if (!success) {
      return apiError(sendError || 'Failed to send email', 500);
    }

    return apiSuccess({ message: 'Magic link sent successfully' });
  } catch (err) {
    serverLogger.error('Magic link send error', { error: err instanceof Error ? err.message : String(err) });
    return apiError('Internal server error', 500);
  }
}
