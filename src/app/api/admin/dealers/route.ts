import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { dbGetDealers, dbUpdateDealer } from '@/lib/db';
import { z } from 'zod';

// GET /api/admin/dealers — get all dealers (admin only)
export async function GET() {
  const { error } = await requireAuth('admin');
  if (error) return error;

  try {
    const dealers = await dbGetDealers();
    return apiSuccess({ dealers });
  } catch {
    return apiError('Failed to fetch dealers', 500);
  }
}

const dealerUpdateSchema = z.object({
  dealerId: z.string(),
  status: z.string().optional(),
  plan: z.string().optional(),
  planPrice: z.number().optional(),
});

// PATCH /api/admin/dealers — update a dealer (admin only)
export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const { data, error } = await parseBody(req, dealerUpdateSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { dealerId, ...updates } = data;
    const updatedDealer = await dbUpdateDealer(dealerId, updates);

    if (!updatedDealer) {
      return apiError('Dealer not found', 404);
    }

    return apiSuccess({ dealer: updatedDealer });
  } catch {
    return apiError('Failed to update dealer', 500);
  }
}
