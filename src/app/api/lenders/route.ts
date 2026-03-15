import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { dbCreateLender, dbGetLenders, dbUpdateLender } from '@/lib/db';
import { logServerError } from '@/lib/server-logger';
import { z } from 'zod';

const updateLenderSchema = z.object({
  lenderId: z.string(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
  referralFee: z.number().min(0).max(10000).optional(),
  maxLoanAmount: z.number().positive().optional(),
  minCreditScore: z.number().int().min(300).max(850).optional(),
});

const createLenderSchema = z.object({
  companyName: z.string().min(1).max(200),
  lenderType: z.enum(['bank', 'credit_union', 'online_lender', 'specialty_finance']),
  nmls: z.string().min(1).max(50),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  state: z.string().min(2).max(2),
  zip: z.string().regex(/^\d{5}$/),
  minCreditScore: z.number().int().min(300).max(850),
  maxCreditScore: z.number().int().min(300).max(850),
  maxDti: z.number().min(0).max(100),
  minRate: z.number().min(0).max(100),
  maxRate: z.number().min(0).max(100),
  maxLoanAmount: z.number().positive(),
  apiKey: z.string().min(1).max(200),
  webhookUrl: z.string().url().optional().or(z.literal('')),
});

// GET /api/lenders
export async function GET() {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const lenders = await dbGetLenders();
    return apiSuccess(lenders);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/lenders', action: 'GET' });
    return apiError('Failed to fetch lenders', 500);
  }
}

export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, createLenderSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const lender = await dbCreateLender({
      name: data.companyName,
      tier: data.minCreditScore >= 700 ? 'prime' : data.minCreditScore >= 620 ? 'near_prime' : 'subprime',
      minFico: data.minCreditScore,
      maxLoanAmount: data.maxLoanAmount,
      maxDti: data.maxDti,
      maxLtv: 120,
      maxPti: 20,
      minLoanAmount: 5000,
      maxVehicleAge: 10,
      maxMileage: 125000,
      acceptsCPO: true,
      acceptsPrivateParty: false,
      acceptsITIN: false,
      statesActive: [data.state],
      referralFee: 0,
      isActive: false,
      integrationStatus: data.webhookUrl ? 'Webhook pending' : 'Pending',
      avgDecisionTimeMinutes: 0,
      appsReceivedMTD: 0,
      approvalRate: 0,
      totalFundedVolume: 0,
      totalReferralFeesOwed: 0,
      lastActivity: new Date().toISOString(),
      rateTiers: [
        {
          ficoMin: data.minCreditScore,
          ficoMax: data.maxCreditScore,
          rateMin: data.minRate,
          rateMax: data.maxRate,
        },
      ],
    });

    if (!lender) return apiError('Failed to create lender', 500);

    return apiSuccess(
      {
        lenderId: lender.id,
        message: 'Lender onboarding submitted',
      },
      201
    );
  } catch (submissionError: unknown) {
    logServerError(submissionError, { route: '/api/lenders', action: 'POST', metadata: { companyName: data.companyName } });
    return apiError('Failed to submit lender onboarding', 500);
  }
}

// PATCH /api/lenders — update a lender
export async function PATCH(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
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
    logServerError(error, { route: '/api/lenders', action: 'PATCH', metadata: { lenderId: data.lenderId } });
    return apiError('Failed to update lender', 500);
  }
}
