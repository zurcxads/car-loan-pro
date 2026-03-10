import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { selectOfferSchema } from '@/lib/validations';
import { dbGetOffers, dbUpdateOffer, dbUpdateApplication, dbGetApplication } from '@/lib/db';

// GET /api/offers?applicationId=APP-001
export async function GET(req: NextRequest) {
  try {
    const applicationId = req.nextUrl.searchParams.get('applicationId') || undefined;
    const offers = await dbGetOffers(applicationId);
    return apiSuccess(offers);
  } catch {
    return apiError('Failed to fetch offers', 500);
  }
}

// POST /api/offers/select — select an offer (hard pull consent)
export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, selectOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    // Update the offer status to selected
    const offer = await dbUpdateOffer(data.offerId, { status: 'selected' as const });
    if (!offer) return apiError('Offer not found', 404);

    // Update application status
    await dbUpdateApplication(data.applicationId, { status: 'conditional' as const } as Record<string, unknown>);

    // Get full app for response
    const app = await dbGetApplication(data.applicationId);

    return apiSuccess({ offer, application: app });
  } catch {
    return apiError('Failed to select offer', 500);
  }
}
