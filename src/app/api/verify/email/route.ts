import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';

// POST /api/verify/email — send verification code to email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return apiError('Invalid email address', 400);
    }

    // TODO: Integrate with OTP service (e.g., Twilio Verify, AWS SES, SendGrid)
    // For now, return success as a stub
    console.log(`[STUB] Sending verification code to email: ${email}`);

    // In production, this would:
    // 1. Generate a 6-digit code
    // 2. Store it in Redis/DB with 10-minute expiry
    // 3. Send email via SendGrid/AWS SES
    // 4. Return success

    return apiSuccess({
      message: 'Verification code sent to your email',
      email,
      expiresIn: 600, // 10 minutes
    });
  } catch (err) {
    console.error('Email verification error:', err);
    return apiError('Failed to send verification code', 500);
  }
}

// PUT /api/verify/email — verify email with code
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return apiError('Email and code are required', 400);
    }

    // TODO: Verify code from Redis/DB
    console.log(`[STUB] Verifying code ${code} for email: ${email}`);

    // In production, this would:
    // 1. Check code against stored value
    // 2. Check if not expired
    // 3. Delete code after successful verification
    // 4. Return success/failure

    // For now, accept any 6-digit code as valid
    if (code.length === 6 && /^\d+$/.test(code)) {
      return apiSuccess({
        verified: true,
        email,
      });
    }

    return apiError('Invalid verification code', 400);
  } catch (err) {
    console.error('Email verification error:', err);
    return apiError('Failed to verify code', 500);
  }
}
