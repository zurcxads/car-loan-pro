import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import { dbGetDeals } from '@/lib/db';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { getFallbackDealerDashboard } from '@/lib/portal-data';
import { useMockData as shouldUseMockData } from '@/lib/env';

export async function GET() {
  const { session, error } = await requireAuth('dealer');
  if (error) return error;

  const dealerId = session?.user.entityId;
  if (!dealerId) {
    return apiError('Missing dealer account', 400);
  }

  try {
    if (shouldUseMockData() || !isSupabaseConfigured()) {
      return apiSuccess(getFallbackDealerDashboard(dealerId));
    }

    const supabase = getServiceClient();
    const [selectedOffersResult, deals] = await Promise.all([
      supabase.from('offers').select('application_id').eq('status', 'selected').order('decision_at', { ascending: false }),
      dbGetDeals(dealerId),
    ]);

    if (selectedOffersResult.error) {
      return apiError('Failed to fetch dealer dashboard', 500);
    }

    const buyers = (selectedOffersResult.data ?? [])
      .map((offer) => offer.application_id)
      .filter((applicationId): applicationId is string => Boolean(applicationId))
      .map((applicationId) => ({
        application: {
          id: applicationId,
        },
      }));

    return apiSuccess({ buyers, deals });
  } catch {
    return apiError('Failed to fetch dealer dashboard', 500);
  }
}
