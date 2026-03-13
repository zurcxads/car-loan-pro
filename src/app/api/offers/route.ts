import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { selectOfferSchema } from '@/lib/validations';
import { dbGetOffers, dbUpdateOffer, dbUpdateApplication, dbGetApplication } from '@/lib/db';

// GET /api/offers?applicationId=APP-001
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const applicationId = req.nextUrl.searchParams.get('applicationId') || undefined;

    // TODO: Add ownership check - users should only see offers for their own applications
    // unless they are admin/lender/dealer with permissions

    const offers = await dbGetOffers(applicationId);
    return apiSuccess(offers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch offers';
    console.error('Failed to fetch offers:', error);
    return apiError(message, 500);
  }
}

// POST /api/offers/select — select an offer (hard pull consent)
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, selectOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    // TODO: Add ownership check - users should only select offers for their own applications

    // Update the offer status to selected
    const offer = await dbUpdateOffer(data.offerId, { status: 'selected' as const });
    if (!offer) return apiError('Offer not found', 404);

    // Update application status
    await dbUpdateApplication(data.applicationId, { status: 'conditional' as const } as Record<string, unknown>);

    // Get full app for response
    const app = await dbGetApplication(data.applicationId);

    return apiSuccess({ offer, application: app });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to select offer';
    console.error('Failed to select offer:', error);
    return apiError(message, 500);
  }
}
