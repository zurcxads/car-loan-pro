import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { dbGetLender, dbUpdateLender } from '@/lib/db';
import { z } from 'zod';

const rulesSchema = z.object({
  minFico: z.number().optional(),
  maxLtv: z.number().optional(),
  maxDti: z.number().optional(),
  maxPti: z.number().optional(),
  minLoanAmount: z.number().optional(),
  maxLoanAmount: z.number().optional(),
  maxVehicleAge: z.number().optional(),
  maxMileage: z.number().optional(),
  acceptsCPO: z.boolean().optional(),
  acceptsPrivateParty: z.boolean().optional(),
  acceptsITIN: z.boolean().optional(),
  statesActive: z.array(z.string()).optional(),
});

// GET /api/lenders/[lenderId]/rules — get lender underwriting rules
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lenderId: string }> }
) {
  const { session, error } = await requireAuth('lender');
  if (error) return error;

  const { lenderId } = await params;

  // AUTHORIZATION: Verify lender owns this resource
  if (lenderId !== session?.user.entityId) {
    return apiError('You can only view rules for your own lender account', 403);
  }

  try {
    const lender = await dbGetLender(lenderId);
    if (!lender) {
      return apiError('Lender not found', 404);
    }

    return apiSuccess({ rules: lender });
  } catch {
    return apiError('Failed to fetch rules', 500);
  }
}

// PATCH /api/lenders/[lenderId]/rules — update lender underwriting rules
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lenderId: string }> }
) {
  const { session, error: authError } = await requireAuth('lender');
  if (authError) return authError;

  const { lenderId } = await params;

  // AUTHORIZATION: Verify lender owns this resource
  if (lenderId !== session?.user.entityId) {
    return apiError('You can only update rules for your own lender account', 403);
  }

  const { data, error } = await parseBody(req, rulesSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const updatedLender = await dbUpdateLender(lenderId, data);
    if (!updatedLender) {
      return apiError('Failed to update rules', 500);
    }

    return apiSuccess({ rules: updatedLender });
  } catch {
    return apiError('Failed to update rules', 500);
  }
}
