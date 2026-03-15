import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBody } from '@/lib/api-helpers';
import { dbGetApplicationByIdAndEmail } from '@/lib/db';
import { findSupabaseUserByEmail } from '@/lib/consumer-auth';
import { consumeMagicToken, getValidMagicToken } from '@/lib/magic-link';
import { serverLogger } from '@/lib/server-logger';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, resetPasswordSchema);
  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Unable to reset password' }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    serverLogger.warn('Consumer reset password unavailable: Supabase service role missing');
    return NextResponse.json({ success: false, error: 'Unable to reset password' }, { status: 503 });
  }

  try {
    const magicLink = await getValidMagicToken(data.token);
    if (!magicLink) {
      return NextResponse.json({ success: false, error: 'This reset link is invalid or expired.' }, { status: 400 });
    }

    const application = await dbGetApplicationByIdAndEmail(magicLink.applicationId, magicLink.email);
    if (!application) {
      return NextResponse.json({ success: false, error: 'Unable to reset password' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const existingUser = await findSupabaseUserByEmail(magicLink.email);
    const userMetadata = {
      application_id: application.id,
      consumer_password_set: true,
      full_name: `${application.borrower.firstName} ${application.borrower.lastName}`.trim(),
      role: 'consumer',
    };

    if (existingUser) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        email: magicLink.email,
        email_confirm: true,
        password: data.password,
        user_metadata: {
          ...existingUser.user_metadata,
          ...userMetadata,
        },
      });

      if (updateError) {
        serverLogger.error('Failed to update consumer password during reset', {
          email: magicLink.email,
          error: updateError.message,
          userId: existingUser.id,
        });
        return NextResponse.json({ success: false, error: 'Unable to reset password' }, { status: 500 });
      }
    } else {
      const { error: createError } = await supabase.auth.admin.createUser({
        email: magicLink.email,
        email_confirm: true,
        password: data.password,
        user_metadata: userMetadata,
      });

      if (createError) {
        serverLogger.error('Failed to create consumer user during password reset', {
          email: magicLink.email,
          error: createError.message,
        });
        return NextResponse.json({ success: false, error: 'Unable to reset password' }, { status: 500 });
      }
    }

    const consumed = await consumeMagicToken(magicLink.id);
    if (!consumed) {
      serverLogger.error('Failed to consume password reset token', {
        applicationId: magicLink.applicationId,
        email: magicLink.email,
      });
      return NextResponse.json({ success: false, error: 'Unable to reset password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (routeError) {
    serverLogger.error('Reset password route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return NextResponse.json({ success: false, error: 'Unable to reset password' }, { status: 500 });
  }
}
