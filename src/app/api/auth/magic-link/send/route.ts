import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBody } from '@/lib/api-helpers';
import { getLatestApplicationForEmail } from '@/lib/consumer-auth';
import { generateMagicToken } from '@/lib/magic-link';
import { magicLinkEmail, sendEmail } from '@/lib/email-templates';
import { serverLogger } from '@/lib/server-logger';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const sendMagicLinkSchema = z.object({
  email: z.string().email(),
});
const MAX_MAGIC_LINKS_PER_HOUR = 3;

/**
 * POST /api/auth/magic-link/send
 * Send a magic link to a user's email
 */
export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, sendMagicLinkSchema);
  if (error || !data) {
    return NextResponse.json({ success: true });
  }

  const email = data.email.trim().toLowerCase();

  try {
    if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getServiceClient();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error: rateLimitError } = await supabase
        .from('magic_links')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneHourAgo);

      if (rateLimitError) {
        serverLogger.error('Magic link rate limit lookup failed', {
          email,
          error: rateLimitError.message,
        });
      } else if ((count ?? 0) >= MAX_MAGIC_LINKS_PER_HOUR) {
        return NextResponse.json(
          { success: false, error: 'Please wait before requesting another link.' },
          { status: 429 }
        );
      }
    }

    const application = await getLatestApplicationForEmail(email);
    if (!application) {
      return NextResponse.json({ success: true });
    }

    const { token, error: tokenError } = await generateMagicToken(email, application.id);
    if (tokenError || !token) {
      serverLogger.error('Magic link token generation failed', {
        email,
        error: tokenError ?? 'Unknown token generation error',
      });
      return NextResponse.json({ success: false, error: 'Unable to send link' }, { status: 500 });
    }

    const magicLinkUrl = `${BASE_URL}/api/auth/magic-link/verify?token=${token}`;

    const emailData = magicLinkEmail(
      email,
      application.borrowerFirstName || 'there',
      magicLinkUrl
    );

    const { success, error: sendError } = await sendEmail(emailData);
    if (!success) {
      serverLogger.error('Magic link email send failed', {
        email,
        error: sendError ?? 'Unknown email send error',
      });
      return NextResponse.json({ success: false, error: 'Unable to send link' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (routeError) {
    serverLogger.error('Magic link send error', {
      email,
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return NextResponse.json({ success: false, error: 'Unable to send link' }, { status: 500 });
  }
}
