import { NextRequest } from 'next/server';
import { apiError } from '@/lib/api-helpers';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import { handleOfferSelection } from '@/lib/select-offer';

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(CONSUMER_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return apiError('Missing session token', 401);
  }

  return handleOfferSelection(req);
}
