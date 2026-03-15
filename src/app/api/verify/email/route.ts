import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { z } from 'zod';
import { createVerificationCode, verifyStoredCode } from '@/lib/verification-codes';
import { logServerError } from '@/lib/server-logger';

const EMAIL_WINDOW_MS = 60 * 60 * 1000;
const EMAIL_MAX_REQUESTS = 5;
const emailVerificationAttempts = new Map<string, number[]>();

function isEmailRateLimited(email: string) {
  const now = Date.now();
  const recentAttempts = (emailVerificationAttempts.get(email) || []).filter(
    (timestamp) => now - timestamp < EMAIL_WINDOW_MS
  );

  if (recentAttempts.length >= EMAIL_MAX_REQUESTS) {
    emailVerificationAttempts.set(email, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  emailVerificationAttempts.set(email, recentAttempts);
  return false;
}

const sendEmailCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyEmailCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

// POST /api/verify/email — send verification code to email
export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, sendEmailCodeSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    if (isEmailRateLimited(data.email.toLowerCase())) {
      return apiError('Too many verification attempts', 429);
    }

    // In production, this would:
    // 1. Generate a 6-digit code
    // 2. Store it in Redis/DB with 10-minute expiry
    // 3. Send email via SendGrid/AWS SES
    // 4. Return success

    const verification = await createVerificationCode('email', data.email, session?.user.id);

    return apiSuccess({
      message: 'Verification code sent to your email',
      email: data.email,
      expiresIn: verification.expiresIn,
      ...(process.env.NODE_ENV !== 'production' ? { code: verification.code } : {}),
    });
  } catch (error: unknown) {
    logServerError(error, { route: '/api/verify/email', action: 'POST', metadata: { email: data.email } });
    return apiError('Failed to send verification code', 500);
  }
}

// PUT /api/verify/email — verify email with code
export async function PUT(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, verifyEmailCodeSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const verified = await verifyStoredCode('email', data.email, data.code);
    if (!verified) {
      return apiError('Invalid or expired verification code', 400);
    }

    return apiSuccess({
      verified: true,
      email: data.email,
    });
  } catch (error: unknown) {
    logServerError(error, { route: '/api/verify/email', action: 'PUT', metadata: { email: data.email } });
    return apiError('Failed to verify code', 500);
  }
}
