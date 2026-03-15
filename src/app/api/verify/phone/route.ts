import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { z } from 'zod';
import { createVerificationCode, verifyStoredCode } from '@/lib/verification-codes';
import { logServerError } from '@/lib/server-logger';

const PHONE_WINDOW_MS = 60 * 60 * 1000;
const PHONE_MAX_REQUESTS = 3;
const phoneVerificationAttempts = new Map<string, number[]>();

function isPhoneRateLimited(phone: string) {
  const now = Date.now();
  const recentAttempts = (phoneVerificationAttempts.get(phone) || []).filter(
    (timestamp) => now - timestamp < PHONE_WINDOW_MS
  );

  if (recentAttempts.length >= PHONE_MAX_REQUESTS) {
    phoneVerificationAttempts.set(phone, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  phoneVerificationAttempts.set(phone, recentAttempts);
  return false;
}

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
    if (isPhoneRateLimited(data.phone)) {
      return apiError('Too many verification attempts', 429);
    }

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
    logServerError(error, { route: '/api/verify/phone', action: 'POST', metadata: { phone: data.phone } });
    return apiError('Failed to send verification code', 500);
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
    logServerError(error, { route: '/api/verify/phone', action: 'PUT', metadata: { phone: data.phone } });
    return apiError('Failed to verify code', 500);
  }
}
