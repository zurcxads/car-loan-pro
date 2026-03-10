import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetLenders, dbUpdateLender } from '@/lib/db';

// GET /api/lenders
export async function GET() {
  try {
    const lenders = await dbGetLenders();
    return apiSuccess(lenders);
  } catch {
    return apiError('Failed to fetch lenders', 500);
  }
}

// PATCH /api/lenders — update a lender
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { lenderId, ...updates } = body;
    if (!lenderId) return apiError('lenderId required');

    const lender = await dbUpdateLender(lenderId, updates);
    if (!lender) return apiError('Lender not found', 404);
    return apiSuccess(lender);
  } catch {
    return apiError('Failed to update lender', 500);
  }
}
