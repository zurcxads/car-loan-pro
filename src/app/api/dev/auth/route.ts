import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { parseBody } from '@/lib/api-helpers';
import {
  createDevAccessToken,
  DEFAULT_DEV_FEATURE_FLAGS,
  getDevAccessExpiryDate,
  getDevAccessPin,
  getDevCookieSettings,
  getDevHintCookieSettings,
  serializeDevFeatureFlags,
  DEV_ACCESS_COOKIE,
  DEV_ACCESS_HINT_COOKIE,
  DEV_FEATURE_FLAGS_COOKIE,
} from '@/lib/dev-access';

const requestSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`dev-auth:${ip}`, 5, 60 * 1000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a minute.', success: false },
      { status: 429 }
    );
  }

  const { data, error } = await parseBody(request, requestSchema);
  if (error) return error;
  if (!data) {
    return NextResponse.json({ error: 'Invalid PIN', success: false }, { status: 400 });
  }

  if (data.pin !== getDevAccessPin()) {
    return NextResponse.json({ error: 'Invalid PIN', success: false }, { status: 401 });
  }

  const { expiresAt, token } = await createDevAccessToken();
  const expiryDate = getDevAccessExpiryDate();
  const response = NextResponse.json({ expiresAt, success: true });

  response.cookies.set(DEV_ACCESS_COOKIE, token, getDevCookieSettings(expiryDate));
  response.cookies.set(DEV_ACCESS_HINT_COOKIE, '1', getDevHintCookieSettings(expiryDate));
  response.cookies.set(
    DEV_FEATURE_FLAGS_COOKIE,
    serializeDevFeatureFlags(DEFAULT_DEV_FEATURE_FLAGS),
    getDevHintCookieSettings(expiryDate)
  );

  return response;
}
