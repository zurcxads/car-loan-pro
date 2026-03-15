import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBody } from '@/lib/api-helpers';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import {
  findSupabaseUserByEmail,
  getConsumerApplicationFromSessionToken,
} from '@/lib/consumer-auth';
import { serverLogger } from '@/lib/server-logger';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

const setPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, setPasswordSchema);
  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Unable to set password' }, { status: 400 });
  }

  const sessionToken = req.cookies.get(CONSUMER_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, error: 'Unable to set password' }, { status: 401 });
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    serverLogger.warn('Consumer set password unavailable: Supabase service role missing');
    return NextResponse.json({ success: false, error: 'Unable to set password' }, { status: 503 });
  }

  try {
    const application = await getConsumerApplicationFromSessionToken(sessionToken);
    if (!application) {
      return NextResponse.json({ success: false, error: 'Unable to set password' }, { status: 401 });
    }

    const email = application.borrowerEmail;
    const userMetadata = {
      application_id: application.id,
      consumer_password_set: true,
      full_name: `${application.borrowerFirstName} ${application.borrowerLastName}`.trim(),
      role: 'consumer',
    };

    const supabase = getServiceClient();
    const existingUser = await findSupabaseUserByEmail(email);

    if (existingUser) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        email,
        email_confirm: true,
        password: data.password,
        user_metadata: {
          ...existingUser.user_metadata,
          ...userMetadata,
        },
      });

      if (updateError) {
        serverLogger.error('Failed to update consumer password', {
          email,
          error: updateError.message,
          userId: existingUser.id,
        });
        return NextResponse.json({ success: false, error: 'Unable to set password' }, { status: 500 });
      }
    } else {
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: data.password,
        user_metadata: userMetadata,
      });

      if (createError) {
        serverLogger.error('Failed to create consumer user with password', {
          email,
          error: createError.message,
        });
        return NextResponse.json({ success: false, error: 'Unable to set password' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (routeError) {
    serverLogger.error('Consumer set password route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return NextResponse.json({ success: false, error: 'Unable to set password' }, { status: 500 });
  }
}
