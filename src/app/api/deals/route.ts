import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { dealSubmitSchema } from '@/lib/validations';
import { dbGetDeals, dbCreateDeal, dbUpdateDeal, dbGetApplication, dbCreateActivityEvent, dbGetDeal } from '@/lib/db';
import { logServerError } from '@/lib/server-logger';
import { z } from 'zod';

const updateDealSchema = z.object({
  dealId: z.string(),
  status: z.enum(['submitted', 'lender_review', 'approved_for_funding', 'wire_sent', 'funded', 'declined']).optional(),
  amount: z.number().positive().optional(),
  rate: z.number().min(0).max(99.99).optional(),
  term: z.number().int().positive().optional(),
  monthlyPayment: z.number().positive().optional(),
  dealerNet: z.number().optional(),
  notes: z.string().max(1000).optional(),
});

// GET /api/deals?dealerId=DLR-001
export async function GET(req: NextRequest) {
  const { session, error: authError } = await requireAuth('dealer');
  if (authError) return authError;

  try {
    const requestedDealerId = req.nextUrl.searchParams.get('dealerId') || undefined;
    const userRole = session?.user.role;
    const dealerId = userRole === 'admin' ? requestedDealerId : session?.user.entityId || undefined;

    if (userRole !== 'admin' && !dealerId) {
      return apiError('Access denied', 403);
    }

    const deals = await dbGetDeals(dealerId);
    return apiSuccess(deals);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/deals', action: 'GET', metadata: { dealerId: req.nextUrl.searchParams.get('dealerId') } });
    return apiError('Failed to fetch deals', 500);
  }
}

// POST /api/deals — submit a new deal
export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAuth('dealer');
  if (authError) return authError;

  const { data, error } = await parseBody(req, dealSubmitSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const userRole = session?.user.role;
    const dealerEntityId = session?.user.entityId;
    if (userRole !== 'admin' && data.dealerId !== dealerEntityId) {
      return apiError('Access denied', 403);
    }

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
    logServerError(error, { route: '/api/deals', action: 'POST', metadata: { applicationId: data.applicationId, dealerId: data.dealerId } });
    return apiError('Failed to create deal', 500);
  }
}

// PATCH /api/deals — update deal status
export async function PATCH(req: NextRequest) {
  const { session, error: authError } = await requireAuth('dealer');
  if (authError) return authError;

  const { data, error } = await parseBody(req, updateDealSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { dealId, ...updates } = data;
    const existingDeal = await dbGetDeal(dealId);
    if (!existingDeal) return apiError('Deal not found', 404);

    if (session?.user.role !== 'admin' && existingDeal.dealerId !== session?.user.entityId) {
      return apiError('Access denied', 403);
    }

    const deal = await dbUpdateDeal(dealId, updates);
    if (!deal) return apiError('Deal not found', 404);
    return apiSuccess(deal);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/deals', action: 'PATCH', metadata: { dealId: data.dealId } });
    return apiError('Failed to update deal', 500);
  }
}
