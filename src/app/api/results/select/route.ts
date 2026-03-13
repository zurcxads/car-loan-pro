import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { dbGetApplicationByToken, dbGetOffer, dbUpdateOffer, dbUpdateApplication } from '@/lib/db';
import { z } from 'zod';

const selectOfferSchema = z.object({
  token: z.string(),
  offerId: z.string(),
  selectedTerm: z.number(),
  selectedDownPayment: z.number(),
});

// POST /api/results/select — consumer selects an offer
export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, selectOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const application = await dbGetApplicationByToken(data.token);
    if (!application) {
      return apiError('Invalid or expired token', 401);
    }

    const offer = await dbGetOffer(data.offerId);
    if (!offer || offer.applicationId !== application.id) {
      return apiError('Invalid offer', 400);
    }

    // Mark this offer as selected
    await dbUpdateOffer(data.offerId, {
      status: 'selected',
    });

    // Update application status to conditional (offer selected but pending final docs)
    await dbUpdateApplication(application.id, {
      status: 'conditional',
      updatedAt: new Date().toISOString(),
    });

    // Return the lender name (reveal)
    return apiSuccess({
      lenderName: offer.lenderName,
      offerId: offer.id,
      selectedTerm: data.selectedTerm,
      selectedDownPayment: data.selectedDownPayment,
    });
  } catch (err) {
    console.error('Offer selection error:', err);
    return apiError('Failed to select offer', 500);
  }
}
