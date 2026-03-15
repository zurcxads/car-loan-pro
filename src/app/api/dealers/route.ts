import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { dbCreateDealer, dbGetDealers, dbUpdateDealer } from '@/lib/db';
import { logServerError } from '@/lib/server-logger';
import { z } from 'zod';

const updateDealerSchema = z.object({
  dealerId: z.string(),
  status: z.enum(['active', 'pending', 'inactive', 'suspended']).optional(),
  plan: z.enum(['trial', 'basic', 'professional', 'enterprise']).optional(),
  planPrice: z.number().min(0).max(10000).optional(),
  name: z.string().min(1).max(200).optional(),
});

const createDealerSchema = z.object({
  dealershipName: z.string().min(1).max(200),
  dealerLicense: z.string().min(1).max(50),
  brands: z.array(z.string().min(1)).min(1),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  state: z.string().min(2).max(2),
  zip: z.string().regex(/^\d{5}$/),
  primaryContactName: z.string().min(1).max(120),
  primaryContactTitle: z.string().min(1).max(120),
  phone: z.string().min(7).max(30),
  email: z.string().email(),
  serviceZipCodes: z.string().max(500).optional(),
  serviceRadius: z.number().int().positive(),
  preferredBrands: z.string().max(1000).optional(),
});

// GET /api/dealers
export async function GET() {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const dealers = await dbGetDealers();
    return apiSuccess(dealers);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/dealers', action: 'GET' });
    return apiError('Failed to fetch dealers', 500);
  }
}

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, createDealerSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const dealer = await dbCreateDealer({
      name: data.dealershipName,
      city: data.city,
      state: data.state,
      address: data.address,
      zip: data.zip,
      phone: data.phone,
      website: '',
      contactEmail: data.email,
      franchiseBrands: data.brands,
      buyersSentMTD: 0,
      dealsFundedMTD: 0,
      plan: 'trial',
      planPrice: 0,
      billingDate: new Date().toISOString(),
      status: 'pending',
      joinedDate: new Date().toISOString(),
      teamMembers: [
        {
          name: data.primaryContactName,
          email: data.email,
          role: data.primaryContactTitle,
          status: 'pending',
          addedDate: new Date().toISOString(),
        },
      ],
    });

    if (!dealer) return apiError('Failed to create dealer', 500);

    return apiSuccess(
      {
        dealerId: dealer.id,
        message: 'Dealer onboarding submitted',
      },
      201
    );
  } catch (submissionError: unknown) {
    logServerError(submissionError, { route: '/api/dealers', action: 'POST', metadata: { dealershipName: data.dealershipName } });
    return apiError('Failed to submit dealer onboarding', 500);
  }
}

// PATCH /api/dealers — update a dealer
export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const { data, error } = await parseBody(req, updateDealerSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { dealerId, ...updates } = data;

    const dealer = await dbUpdateDealer(dealerId, updates);
    if (!dealer) return apiError('Dealer not found', 404);
    return apiSuccess(dealer);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/dealers', action: 'PATCH', metadata: { dealerId: data.dealerId } });
    return apiError('Failed to update dealer', 500);
  }
}
