import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { dbGetLenders, dbUpdateLender } from '@/lib/db';
import { z } from 'zod';

// GET /api/admin/lenders — get all lenders (admin only)
export async function GET() {
  const { error } = await requireAuth('admin');
  if (error) return error;

  try {
    const lenders = await dbGetLenders();
    return apiSuccess({ lenders });
  } catch {
    return apiError('Failed to fetch lenders', 500);
  }
}

const lenderUpdateSchema = z.object({
  lenderId: z.string(),
  isActive: z.boolean().optional(),
  name: z.string().optional(),
  referralFee: z.number().optional(),
});

// PATCH /api/admin/lenders — update a lender (admin only)
export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const { data, error } = await parseBody(req, lenderUpdateSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { lenderId, ...updates } = data;
    const updatedLender = await dbUpdateLender(lenderId, updates);

    if (!updatedLender) {
      return apiError('Lender not found', 404);
    }

    return apiSuccess({ lender: updatedLender });
  } catch {
    return apiError('Failed to update lender', 500);
  }
}
