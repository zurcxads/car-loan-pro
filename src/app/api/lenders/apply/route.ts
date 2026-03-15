import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody } from '@/lib/api-helpers';
import { useMockData as shouldUseMockData } from '@/lib/env';
import { serverLogger } from '@/lib/server-logger';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

const lenderApplicationSchema = z.object({
  companyName: z.string().min(1).max(200),
  nmlsNumber: z.string().min(1).max(100),
  primaryContactName: z.string().min(1).max(150),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  minFicoScore: z.string().min(1).max(10),
  maxLtv: z.number().min(0).max(250),
  rateMin: z.number().min(0).max(100),
  rateMax: z.number().min(0).max(100),
  statesServed: z.string().min(1).max(1000),
  minLoanAmount: z.number().min(0),
  maxLoanAmount: z.number().min(0),
  maxTermMonths: z.number().int().min(12).max(120),
  certifiedAccurate: z.literal(true),
});

export async function POST(request: NextRequest) {
  const { data, error } = await parseBody(request, lenderApplicationSchema);
  if (error) return error;
  if (!data) return apiError('Invalid request', 400);

  try {
    serverLogger.info('Lender application submitted', {
      companyName: data.companyName,
      email: data.email,
      nmlsNumber: data.nmlsNumber,
    });

    if (shouldUseMockData()) {
      return apiSuccess({ success: true });
    }

    if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return apiError('Unable to process request', 503);
    }

    const supabase = getServiceClient();
    const payload = {
      company_name: data.companyName,
      nmls_number: data.nmlsNumber,
      primary_contact_name: data.primaryContactName,
      email: data.email,
      phone: data.phone,
      min_fico_score: data.minFicoScore,
      max_ltv: data.maxLtv,
      rate_min: data.rateMin,
      rate_max: data.rateMax,
      states_served: data.statesServed,
      min_loan_amount: data.minLoanAmount,
      max_loan_amount: data.maxLoanAmount,
      max_term_months: data.maxTermMonths,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    const primaryInsert = await supabase.from('lender_applications').insert(payload);
    if (primaryInsert.error) {
      const fallbackInsert = await supabase.from('lenders').insert({
        name: data.companyName,
        min_fico: Number(data.minFicoScore) || 0,
        max_ltv: data.maxLtv,
        min_loan_amount: data.minLoanAmount,
        max_loan_amount: data.maxLoanAmount,
        states_active: data.statesServed.split(',').map((state) => state.trim()).filter(Boolean),
        is_active: false,
        integration_status: 'pending',
        referral_fee: 0,
        max_dti: 50,
        max_pti: 20,
        max_vehicle_age: 12,
        max_mileage: 150000,
        accepts_cpo: true,
        accepts_private_party: false,
        accepts_itin: false,
        avg_decision_time_minutes: 0,
        rate_tiers: [{
          ficoMin: Number(data.minFicoScore) || 0,
          ficoMax: 850,
          rateMin: data.rateMin,
          rateMax: data.rateMax,
        }],
      });

      if (fallbackInsert.error) {
        serverLogger.error('Lender application persistence failed', {
          lenderApplicationsError: primaryInsert.error.message,
          lendersError: fallbackInsert.error.message,
        });
        return apiError('Unable to process request', 500);
      }
    }

    return apiSuccess({ success: true });
  } catch (routeError) {
    serverLogger.error('Lender application route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return apiError('Unable to process request', 500);
  }
}
