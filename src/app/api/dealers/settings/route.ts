import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import { dbGetDealer } from '@/lib/db';
import { getFallbackDealerSettings } from '@/lib/portal-data';
import { useMockData as shouldUseMockData } from '@/lib/env';

export async function GET() {
  const { session, error } = await requireAuth('dealer');
  if (error) return error;

  const dealerId = session?.user.entityId;
  if (!dealerId) {
    return apiError('Missing dealer account', 400);
  }

  try {
    if (shouldUseMockData()) {
      return apiSuccess(getFallbackDealerSettings(dealerId));
    }

    const dealer = await dbGetDealer(dealerId);
    if (!dealer) {
      return apiError('Dealer not found', 404);
    }

    return apiSuccess({
      dealer,
      notifications: {
        smsAlerts: true,
        emailDigest: 'daily',
        smsPhone: dealer.phone,
      },
    });
  } catch {
    return apiError('Failed to fetch dealer settings', 500);
  }
}
