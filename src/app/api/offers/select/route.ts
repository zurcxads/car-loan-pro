import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody } from '@/lib/api-helpers';
import {
  dbGetApplicationByToken,
  dbGetOffer,
  dbGetOffers,
  dbUpdateApplication,
  dbUpdateOffer,
} from '@/lib/db';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';

const selectOfferSchema = z.object({
  offerId: z.string().min(1),
  selectedTerm: z.number().int().positive(),
  selectedDownPayment: z.number().min(0),
});

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, selectOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  const token = req.cookies.get(CONSUMER_SESSION_COOKIE)?.value;
  if (!token) {
    return apiError('Missing session token', 401);
  }

  try {
    const application = await dbGetApplicationByToken(token);
    if (!application) {
      return apiError('Invalid or expired token', 401);
    }

    const offer = await dbGetOffer(data.offerId);
    if (!offer || offer.applicationId !== application.id) {
      return apiError('Invalid offer', 400);
    }

    await dbUpdateOffer(offer.id, { status: 'selected' });

    const siblingOffers = await dbGetOffers(application.id);
    await Promise.all(
      siblingOffers
        .filter((sibling) => sibling.id !== offer.id && sibling.status !== 'declined')
        .map((sibling) => dbUpdateOffer(sibling.id, { status: 'declined' }))
    );

    await dbUpdateApplication(application.id, {
      status: 'conditional',
      updatedAt: new Date().toISOString(),
    });

    return apiSuccess({
      lenderName: offer.lenderName,
      offerId: offer.id,
      selectedTerm: data.selectedTerm,
      selectedDownPayment: data.selectedDownPayment,
      redirectTo: '/dashboard',
    });
  } catch (err) {
    console.error('Offer selection error:', err);
    return apiError('Failed to select offer', 500);
  }
}
