import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import { dbGetLender } from '@/lib/db';
import { getFallbackLenderRules } from '@/lib/portal-data';
import { useMockData as shouldUseMockData } from '@/lib/env';

export async function GET() {
  const { session, error } = await requireAuth('lender');
  if (error) return error;

  const lenderId = session?.user.entityId;
  if (!lenderId) {
    return apiError('Missing lender account', 400);
  }

  try {
    if (shouldUseMockData()) {
      return apiSuccess({ rules: getFallbackLenderRules(lenderId) });
    }

    const lender = await dbGetLender(lenderId);
    if (!lender) {
      return apiError('Lender not found', 404);
    }

    return apiSuccess({ rules: lender });
  } catch {
    return apiError('Failed to fetch lender rules', 500);
  }
}
