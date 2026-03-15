import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { selectOfferSchema } from '@/lib/validations';
import { dbGetOffers, dbUpdateOffer, dbUpdateApplication, dbGetOfferByIdAndApplicationId } from '@/lib/db';
import { getOwnedApplicationForRequest } from '@/lib/application-ownership';
import { logServerError } from '@/lib/server-logger';

// GET /api/offers?applicationId=APP-001
export async function GET(req: NextRequest) {
  try {
    const applicationId = req.nextUrl.searchParams.get('applicationId') || undefined;
    if (!applicationId) return apiError('Application ID is required', 400);

    const { application, error } = await getOwnedApplicationForRequest(req, applicationId);
    if (error) return error;
    if (!application) return apiError('Access denied', 403);

    const offers = await dbGetOffers(applicationId);
    return apiSuccess(offers);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/offers', action: 'GET', metadata: { applicationId: req.nextUrl.searchParams.get('applicationId') } });
    return apiError('Failed to fetch offers', 500);
  }
}

// POST /api/offers/select — select an offer (hard pull consent)
export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, selectOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { application, error: ownershipError } = await getOwnedApplicationForRequest(req, data.applicationId);
    if (ownershipError) return ownershipError;
    if (!application) return apiError('Access denied', 403);

    const ownedOffer = await dbGetOfferByIdAndApplicationId(data.offerId, data.applicationId);
    if (!ownedOffer) return apiError('Access denied', 403);

    // Update the offer status to selected
    const offer = await dbUpdateOffer(data.offerId, { status: 'selected' as const });
    if (!offer) return apiError('Offer not found', 404);

    // Update application status
    await dbUpdateApplication(data.applicationId, { status: 'under_review' as const } as Record<string, unknown>);

    // Get full app for response
    return apiSuccess({ offer, application });
  } catch (error: unknown) {
    logServerError(error, { route: '/api/offers', action: 'POST', metadata: { applicationId: data.applicationId, offerId: data.offerId } });
    return apiError('Failed to select offer', 500);
  }
}
