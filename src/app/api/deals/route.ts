import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { dealSubmitSchema } from '@/lib/validations';
import { dbGetDeals, dbCreateDeal, dbUpdateDeal, dbGetApplication, dbCreateActivityEvent } from '@/lib/db';
import { z } from 'zod';

const updateDealSchema = z.object({
  dealId: z.string(),
  status: z.enum(['submitted', 'pending_stipulations', 'funded', 'cancelled', 'declined']).optional(),
  amount: z.number().positive().optional(),
  rate: z.number().min(0).max(99.99).optional(),
  term: z.number().int().positive().optional(),
  monthlyPayment: z.number().positive().optional(),
  dealerNet: z.number().optional(),
  notes: z.string().max(1000).optional(),
});

// GET /api/deals?dealerId=DLR-001
export async function GET(req: NextRequest) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const dealerId = req.nextUrl.searchParams.get('dealerId') || undefined;

    // TODO: Add ownership check - dealers should only see their own deals
    // unless they are admin with permissions

    const deals = await dbGetDeals(dealerId);
    return apiSuccess(deals);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch deals';
    console.error('Failed to fetch deals:', error);
    return apiError(message, 500);
  }
}

// POST /api/deals — submit a new deal
export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, dealSubmitSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    // TODO: Add ownership check - dealers should only create deals for their dealership

    const app = await dbGetApplication(data.applicationId);
    if (!app) return apiError('Application not found', 404);
    if (!app.vehicle) return apiError('Application must have vehicle information to create a deal', 400);

    const deal = await dbCreateDeal({
      applicationId: data.applicationId,
      dealerId: data.dealerId,
      buyerFirstName: app.borrower.firstName,
      buyerLastInitial: app.borrower.lastName[0],
      vehicle: `${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model} ${app.vehicle.trim || ''}`.trim(),
      vin: data.vin,
      lenderName: 'Selected Lender',
      amount: data.salePrice - data.downPayment,
      rate: 0,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create deal';
    console.error('Failed to create deal:', error);
    return apiError(message, 500);
  }
}

// PATCH /api/deals — update deal status
export async function PATCH(req: NextRequest) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, updateDealSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { dealId, ...updates } = data;

    // TODO: Add ownership check - dealers should only update their own deals

    const deal = await dbUpdateDeal(dealId, updates);
    if (!deal) return apiError('Deal not found', 404);
    return apiSuccess(deal);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update deal';
    console.error('Failed to update deal:', error);
    return apiError(message, 500);
  }
}
