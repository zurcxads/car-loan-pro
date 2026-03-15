import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseBody } from '@/lib/api-helpers';
import {
  CONSUMER_SESSION_COOKIE,
  getConsumerSessionCookieOptions,
} from '@/lib/consumer-session';
import { getLatestApplicationForEmail } from '@/lib/consumer-auth';
import { serverLogger } from '@/lib/server-logger';
import { isSupabaseConfigured } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getAnonSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );
}

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, loginSchema);
  if (error) {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 400 });
  }

  if (!data || !isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }

  try {
    const supabase = getAnonSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      serverLogger.warn('Consumer password login failed', {
        email: data.email.toLowerCase(),
        error: authError?.message,
      });
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const application = await getLatestApplicationForEmail(data.email);
    if (!application?.sessionToken) {
      serverLogger.warn('Consumer password login missing application session', {
        email: data.email.toLowerCase(),
        userId: authData.user.id,
      });
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      redirectTo: '/dashboard',
    });

    response.cookies.set(
      CONSUMER_SESSION_COOKIE,
      application.sessionToken,
      getConsumerSessionCookieOptions()
    );

    return response;
  } catch (routeError) {
    serverLogger.error('Consumer password login route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 500 });
  }
}
