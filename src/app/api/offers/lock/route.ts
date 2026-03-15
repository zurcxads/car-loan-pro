import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody } from '@/lib/api-helpers';
import {
  dbGetApplicationByToken,
  dbGetOfferByIdAndApplicationId,
  dbUpdateApplication,
  dbUpdateOffer,
} from '@/lib/db';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import { serverLogger } from '@/lib/server-logger';

const lockOfferSchema = z.object({
  offerId: z.string().min(1),
  applicationId: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value;
  if (!token) {
    return apiError('Unauthorized', 401);
  }

  const { data, error } = await parseBody(request, lockOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid request', 400);

  try {
    const application = await dbGetApplicationByToken(token);
    if (!application) {
      return apiError('Unauthorized', 401);
    }

    if (data.applicationId && data.applicationId !== application.id) {
      return apiError('Unauthorized', 403);
    }

    const offer = await dbGetOfferByIdAndApplicationId(data.offerId, application.id);
    if (!offer) {
      return apiError('Not found', 404);
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [updatedOffer, updatedApplication] = await Promise.all([
      dbUpdateOffer(offer.id, {
        status: 'locked',
        lockedAt: now.toISOString(),
      }),
      dbUpdateApplication(application.id, {
        status: 'offer_accepted',
        lockedOfferId: offer.id,
        offerLockedAt: now.toISOString(),
        offerExpiresAt: expiresAt.toISOString(),
      }),
    ]);

    if (!updatedOffer || !updatedApplication) {
      return apiError('Unable to process request', 500);
    }

    return apiSuccess({
      success: true,
      redirectTo: '/dashboard',
    });
  } catch (routeError) {
    serverLogger.error('Offer lock route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return apiError('Unable to process request', 500);
  }
}
