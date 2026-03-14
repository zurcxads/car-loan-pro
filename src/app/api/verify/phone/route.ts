import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { z } from 'zod';
import { createVerificationCode, verifyStoredCode } from '@/lib/verification-codes';

const sendPhoneCodeSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

const verifyPhoneCodeSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

// POST /api/verify/phone — send verification code via SMS
export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, sendPhoneCodeSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    // TODO: Add rate limiting here (3 SMS per hour per user)
    // TODO: Integrate with SMS service (e.g., Twilio, AWS SNS)

    // In production, this would:
    // 1. Generate a 6-digit code
    // 2. Store it in Redis/DB with 10-minute expiry
    // 3. Send SMS via Twilio/AWS SNS
    // 4. Return success

    const verification = await createVerificationCode('phone', data.phone, session?.user.id);

    return apiSuccess({
      message: 'Verification code sent via SMS',
      phone: data.phone,
      expiresIn: verification.expiresIn,
      ...(process.env.NODE_ENV !== 'production' ? { code: verification.code } : {}),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send verification code';
    console.error('Phone verification error:', error);
    return apiError(message, 500);
  }
}

// PUT /api/verify/phone — verify phone with code
export async function PUT(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, verifyPhoneCodeSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const verified = await verifyStoredCode('phone', data.phone, data.code);
    if (!verified) {
      return apiError('Invalid or expired verification code', 400);
    }

    return apiSuccess({
      verified: true,
      phone: data.phone,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify code';
    console.error('Phone verification error:', error);
    return apiError(message, 500);
  }
}
