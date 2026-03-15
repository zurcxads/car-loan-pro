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

const cancelOfferSchema = z.object({
  offerId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value;
  if (!token) {
    return apiError('Unauthorized', 401);
  }

  const { data, error } = await parseBody(request, cancelOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid request', 400);

  try {
    const application = await dbGetApplicationByToken(token);
    if (!application) {
      return apiError('Unauthorized', 401);
    }

    const offer = await dbGetOfferByIdAndApplicationId(data.offerId, application.id);
    if (!offer) {
      return apiError('Not found', 404);
    }

    const [updatedOffer, updatedApplication] = await Promise.all([
      dbUpdateOffer(offer.id, {
        status: 'available',
        lockedAt: null,
      }),
      dbUpdateApplication(application.id, {
        status: 'offers_available',
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
    serverLogger.error('Offer cancel route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return apiError('Unable to process request', 500);
  }
}
