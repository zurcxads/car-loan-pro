import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';

// POST /api/verify/phone — send verification code via SMS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return apiError('Invalid phone number', 400);
    }

    // TODO: Integrate with SMS service (e.g., Twilio, AWS SNS)
    console.log(`[STUB] Sending verification code to phone: ${phone}`);

    // In production, this would:
    // 1. Generate a 6-digit code
    // 2. Store it in Redis/DB with 10-minute expiry
    // 3. Send SMS via Twilio/AWS SNS
    // 4. Return success

    return apiSuccess({
      message: 'Verification code sent via SMS',
      phone,
      expiresIn: 600, // 10 minutes
    });
  } catch (err) {
    console.error('Phone verification error:', err);
    return apiError('Failed to send verification code', 500);
  }
}

// PUT /api/verify/phone — verify phone with code
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return apiError('Phone and code are required', 400);
    }

    // TODO: Verify code from Redis/DB
    console.log(`[STUB] Verifying code ${code} for phone: ${phone}`);

    // In production, this would:
    // 1. Check code against stored value
    // 2. Check if not expired
    // 3. Delete code after successful verification
    // 4. Return success/failure

    // For now, accept any 6-digit code as valid
    if (code.length === 6 && /^\d+$/.test(code)) {
      return apiSuccess({
        verified: true,
        phone,
      });
    }

    return apiError('Invalid verification code', 400);
  } catch (err) {
    console.error('Phone verification error:', err);
    return apiError('Failed to verify code', 500);
  }
}
