import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetOffer, dbUpdateOffer, dbUpdateApplication, dbGetOffers, dbGetApplication } from '@/lib/db';

// POST /api/offers/[id]/select — consumer selects an offer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get the selected offer
    const offer = await dbGetOffer(id);
    if (!offer) {
      return apiError('Offer not found', 404);
    }

    // Get the application
    const application = await dbGetApplication(offer.applicationId);
    if (!application) {
      return apiError('Application not found', 404);
    }

    // Mark this offer as selected
    await dbUpdateOffer(id, { status: 'selected' });

    // Mark all other offers for this application as declined
    const allOffers = await dbGetOffers(offer.applicationId);
    const updatePromises = allOffers
      .filter(o => o.id !== id && o.status !== 'declined')
      .map(o => dbUpdateOffer(o.id, { status: 'declined' }));
    await Promise.all(updatePromises);

    // Update application status to pre_approved
    await dbUpdateApplication(offer.applicationId, {
      status: 'offers_available', // Keep as offers_available but consumer has selected one
    });

    // Generate approval token for the letter
    const approvalToken = crypto.randomUUID();

    // In production, store this token in a separate table or in the offer data
    // For now, we'll pass it back and use it as a query param

    return apiSuccess({
      message: 'Offer selected successfully',
      offer: { ...offer, status: 'selected' },
      approvalToken,
      applicationId: offer.applicationId,
    });
  } catch (error) {
    console.error('Error selecting offer:', error);
    return apiError('Failed to select offer', 500);
  }
}
