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

const expireOfferSchema = z.object({
  applicationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value;
  if (!token) {
    return apiError('Unauthorized', 401);
  }

  const { data, error } = await parseBody(request, expireOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid request', 400);

  try {
    const application = await dbGetApplicationByToken(token);
    if (!application || application.id !== data.applicationId) {
      return apiError('Unauthorized', 401);
    }

    if (!application.lockedOfferId || !application.offerExpiresAt) {
      return apiError('No active locked offer found', 400);
    }

    const expiresAt = new Date(application.offerExpiresAt);
    if (Number.isNaN(expiresAt.getTime())) {
      return apiError('Offer expiration is invalid', 400);
    }

    if (expiresAt.getTime() >= Date.now()) {
      return apiError('Offer has not expired yet', 400);
    }

    const offer = await dbGetOfferByIdAndApplicationId(application.lockedOfferId, application.id);
    if (!offer) {
      return apiError('Not found', 404);
    }

    const [updatedOffer, updatedApplication] = await Promise.all([
      dbUpdateOffer(offer.id, {
        status: 'expired',
        lockedAt: null,
      }),
      dbUpdateApplication(application.id, {
        status: 'expired',
        lockedOfferId: null,
        offerLockedAt: null,
        offerExpiresAt: null,
      }),
    ]);

    if (!updatedOffer || !updatedApplication) {
      return apiError('Unable to process request', 500);
    }

    return apiSuccess({ success: true });
  } catch (routeError) {
    serverLogger.error('Offer expire route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return apiError('Unable to process request', 500);
  }
}
