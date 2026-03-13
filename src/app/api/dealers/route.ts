import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { dbGetDealers, dbUpdateDealer } from '@/lib/db';
import { z } from 'zod';

const updateDealerSchema = z.object({
  dealerId: z.string(),
  status: z.enum(['active', 'pending', 'inactive', 'suspended']).optional(),
  plan: z.enum(['trial', 'basic', 'professional', 'enterprise']).optional(),
  planPrice: z.number().min(0).max(10000).optional(),
  name: z.string().min(1).max(200).optional(),
});

// GET /api/dealers
export async function GET() {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const dealers = await dbGetDealers();
    return apiSuccess(dealers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dealers';
    console.error('Failed to fetch dealers:', error);
    return apiError(message, 500);
  }
}

// PATCH /api/dealers — update a dealer
export async function PATCH(req: NextRequest) {
  const { session, error: authError } = await requireAuth('admin');
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
    const message = error instanceof Error ? error.message : 'Failed to update dealer';
    console.error('Failed to update dealer:', error);
    return apiError(message, 500);
  }
}
