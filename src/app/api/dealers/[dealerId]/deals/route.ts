import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { dbCreateDeal } from '@/lib/db';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { z } from 'zod';

const dealSchema = z.object({
  applicationId: z.string(),
  buyerFirstName: z.string(),
  buyerLastInitial: z.string(),
  vehicle: z.string(),
  vin: z.string(),
  lenderName: z.string(),
  amount: z.number(),
  rate: z.number(),
  term: z.number(),
  monthlyPayment: z.number(),
});

// GET /api/dealers/[dealerId]/deals — get dealer's deals
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  const { session, error } = await requireAuth('dealer');
  if (error) return error;

  const { dealerId } = await params;
  if (dealerId !== session?.user.entityId) {
    return apiError('You can only view deals for your own dealership', 403);
  }

  try {
    if (!isSupabaseConfigured()) {
      return apiError('Supabase is not configured', 503);
    }

    const supabase = getServiceClient();
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('submitted_at', { ascending: false });
    if (dealsError) {
      return apiError('Failed to fetch deals', 500);
    }

    return apiSuccess({ deals: deals || [] });
  } catch {
    return apiError('Failed to fetch deals', 500);
  }
}

// POST /api/dealers/[dealerId]/deals — create a new deal
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  const { session, error: authError } = await requireAuth('dealer');
  if (authError) return authError;

  const { dealerId } = await params;
  if (dealerId !== session?.user.entityId) {
    return apiError('You can only create deals for your own dealership', 403);
  }

  const { data, error } = await parseBody(req, dealSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const deal = await dbCreateDeal({
      dealerId,
      applicationId: data.applicationId,
      buyerFirstName: data.buyerFirstName,
      buyerLastInitial: data.buyerLastInitial,
      vehicle: data.vehicle,
      vin: data.vin,
      lenderName: data.lenderName,
      amount: data.amount,
      rate: data.rate,
      term: data.term,
      monthlyPayment: data.monthlyPayment,
      status: 'submitted',
      daysOpen: 0,
      dealerNet: 0,
      submittedAt: new Date().toISOString(),
      events: [],
    });

    return apiSuccess({ deal }, 201);
  } catch {
    return apiError('Failed to create deal', 500);
  }
}
