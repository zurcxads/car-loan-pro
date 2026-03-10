import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetDealers, dbUpdateDealer } from '@/lib/db';

// GET /api/dealers
export async function GET() {
  try {
    const dealers = await dbGetDealers();
    return apiSuccess(dealers);
  } catch {
    return apiError('Failed to fetch dealers', 500);
  }
}

// PATCH /api/dealers — update a dealer
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { dealerId, ...updates } = body;
    if (!dealerId) return apiError('dealerId required');

    const dealer = await dbUpdateDealer(dealerId, updates);
    if (!dealer) return apiError('Dealer not found', 404);
    return apiSuccess(dealer);
  } catch {
    return apiError('Failed to update dealer', 500);
  }
}
