import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { z } from 'zod';

const sendEmailCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyEmailCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

// POST /api/verify/email — send verification code to email
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, sendEmailCodeSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    // TODO: Add rate limiting here (5 emails per hour per user)
    // TODO: Integrate with email service (e.g., SendGrid, AWS SES)

    // In production, this would:
    // 1. Generate a 6-digit code
    // 2. Store it in Redis/DB with 10-minute expiry
    // 3. Send email via SendGrid/AWS SES
    // 4. Return success

    return apiSuccess({
      message: 'Verification code sent to your email',
      email: data.email,
      expiresIn: 600,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send verification code';
    console.error('Email verification error:', error);
    return apiError(message, 500);
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
    // TODO: Verify code from Redis/DB
    // In production, this would:
    // 1. Check code against stored value
    // 2. Check if not expired
    // 3. Delete code after successful verification
    // 4. Return success/failure

    // For now, accept any 6-digit code as valid
    return apiSuccess({
      verified: true,
      email: data.email,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify code';
    console.error('Email verification error:', error);
    return apiError(message, 500);
  }
}
