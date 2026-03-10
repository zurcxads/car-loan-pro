import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { dealSubmitSchema } from '@/lib/validations';
import { dbGetDeals, dbCreateDeal, dbUpdateDeal, dbGetApplication, dbCreateActivityEvent } from '@/lib/db';

// GET /api/deals?dealerId=DLR-001
export async function GET(req: NextRequest) {
  try {
    const dealerId = req.nextUrl.searchParams.get('dealerId') || undefined;
    const deals = await dbGetDeals(dealerId);
    return apiSuccess(deals);
  } catch {
    return apiError('Failed to fetch deals', 500);
  }
}

// POST /api/deals — submit a new deal
export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, dealSubmitSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const app = await dbGetApplication(data.applicationId);
    if (!app) return apiError('Application not found', 404);

    const deal = await dbCreateDeal({
      applicationId: data.applicationId,
      dealerId: data.dealerId,
      buyerFirstName: app.borrower.firstName,
      buyerLastInitial: app.borrower.lastName[0],
      vehicle: `${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model} ${app.vehicle.trim}`,
      vin: data.vin,
      lenderName: 'Selected Lender',
      amount: data.salePrice - data.downPayment,
      rate: 0, // Will be set from offer
      term: 60,
      monthlyPayment: 0,
      status: 'submitted',
      daysOpen: 0,
      dealerNet: 0,
      submittedAt: new Date().toISOString(),
      events: [{ timestamp: new Date().toISOString(), event: 'Deal submitted' }],
    });

    await dbCreateActivityEvent({
      type: 'application',
      timestamp: new Date().toISOString(),
      description: `Deal submitted for ${app.borrower.firstName} ${app.borrower.lastName}`,
    });

    return apiSuccess(deal, 201);
  } catch {
    return apiError('Failed to create deal', 500);
  }
}

// PATCH /api/deals — update deal status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealId, ...updates } = body;
    if (!dealId) return apiError('dealId required');

    const deal = await dbUpdateDeal(dealId, updates);
    if (!deal) return apiError('Deal not found', 404);
    return apiSuccess(deal);
  } catch {
    return apiError('Failed to update deal', 500);
  }
}
