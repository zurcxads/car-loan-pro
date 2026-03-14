export const CONSUMER_SESSION_COOKIE = 'alp_consumer_session';
export const CONSUMER_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export function getConsumerSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CONSUMER_SESSION_MAX_AGE,
  };
}
