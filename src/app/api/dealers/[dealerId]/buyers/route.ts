import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetApplications, dbGetOffers } from '@/lib/db';

// GET /api/dealers/[dealerId]/buyers — get pre-approved consumers in dealer's area
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  const { error } = await requireAuth('dealer');
  if (error) return error;

  const { dealerId } = await params;

  try {
    // Get all applications with offers
    const allApplications = await dbGetApplications();
    const preApprovedApps = allApplications.filter(app => app.status === 'offers_available');

    // Get selected offers for each application
    const buyersWithOffers = await Promise.all(
      preApprovedApps.map(async (app) => {
        const offers = await dbGetOffers(app.id);
        const selectedOffer = offers.find(o => o.status === 'selected');

        return {
          application: app,
          selectedOffer,
          buyer: {
            firstName: app.borrower.firstName,
            lastInitial: app.borrower.lastName[0],
            city: app.borrower.city,
            state: app.borrower.state,
            zip: app.borrower.zip,
            approvedAmount: selectedOffer?.approvedAmount || 0,
            lenderName: selectedOffer?.lenderName || '',
            status: selectedOffer ? 'selected' : 'reviewing',
          },
        };
      })
    );

    // Filter out buyers without selected offers and sort by approved amount
    const qualifiedBuyers = buyersWithOffers
      .filter(b => b.selectedOffer)
      .sort((a, b) => (b.selectedOffer?.approvedAmount || 0) - (a.selectedOffer?.approvedAmount || 0));

    return apiSuccess({ buyers: qualifiedBuyers });
  } catch {
    return apiError('Failed to fetch buyers', 500);
  }
}
