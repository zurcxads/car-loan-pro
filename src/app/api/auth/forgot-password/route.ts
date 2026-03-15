import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBody } from '@/lib/api-helpers';
import { getLatestApplicationForEmail } from '@/lib/consumer-auth';
import { passwordResetEmail, sendEmail } from '@/lib/email-templates';
import { generateMagicToken } from '@/lib/magic-link';
import { serverLogger } from '@/lib/server-logger';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, forgotPasswordSchema);
  if (error || !data) {
    return NextResponse.json({ success: true });
  }

  const email = data.email.trim().toLowerCase();

  try {
    const application = await getLatestApplicationForEmail(email);
    if (!application) {
      return NextResponse.json({ success: true });
    }

    const { token } = await generateMagicToken(email, application.id);
    if (!token) {
      serverLogger.error('Forgot password token generation failed', { email });
      return NextResponse.json({ success: true });
    }

    const resetLink = `${BASE_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const emailData = passwordResetEmail(
      email,
      application.borrowerFirstName || 'there',
      resetLink
    );

    const { success, error: sendError } = await sendEmail(emailData);
    if (!success) {
      serverLogger.error('Forgot password email send failed', {
        email,
        error: sendError ?? 'Unknown email send error',
      });
    }

    return NextResponse.json({ success: true });
  } catch (routeError) {
    serverLogger.error('Forgot password route failed', {
      email,
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return NextResponse.json({ success: true });
  }
}
