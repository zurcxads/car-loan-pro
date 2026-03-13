import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { dbGetLenders, dbUpdateLender } from '@/lib/db';
import { z } from 'zod';

const updateLenderSchema = z.object({
  lenderId: z.string(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
  referralFee: z.number().min(0).max(10000).optional(),
  maxLoanAmount: z.number().positive().optional(),
  minCreditScore: z.number().int().min(300).max(850).optional(),
});

// GET /api/lenders
export async function GET() {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const lenders = await dbGetLenders();
    return apiSuccess(lenders);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch lenders';
    console.error('Failed to fetch lenders:', error);
    return apiError(message, 500);
  }
}

// PATCH /api/lenders — update a lender
export async function PATCH(req: NextRequest) {
  const { session, error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const { data, error } = await parseBody(req, updateLenderSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { lenderId, ...updates } = data;

    const lender = await dbUpdateLender(lenderId, updates);
    if (!lender) return apiError('Lender not found', 404);
    return apiSuccess(lender);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update lender';
    console.error('Failed to update lender:', error);
    return apiError(message, 500);
  }
}
