import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import { dbGetDealers, dbGetLenders } from '@/lib/db';
import { getFallbackRevenueBillingData } from '@/lib/portal-data';
import { useMockData as shouldUseMockData } from '@/lib/env';

export async function GET() {
  const { error } = await requireAuth('admin');
  if (error) return error;

  try {
    if (shouldUseMockData()) {
      return apiSuccess(getFallbackRevenueBillingData());
    }

    const [lenders, dealers] = await Promise.all([dbGetLenders(), dbGetDealers()]);
    const fallbackData = getFallbackRevenueBillingData();

    return apiSuccess({
      lenders,
      dealers,
      monthlyRevenue: fallbackData.monthlyRevenue,
    });
  } catch {
    return apiError('Failed to fetch billing data', 500);
  }
}
