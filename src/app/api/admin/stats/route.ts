import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  try {
    if (!isSupabaseConfigured()) {
      return apiError('Supabase is not configured', 503);
    }

    const supabase = getServiceClient();
    const type = req.nextUrl.searchParams.get('type');

    if (type === 'events') {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) return apiError('Failed to fetch events', 500);
      return apiSuccess(data || []);
    }

    if (type === 'compliance') {
      const { data, error } = await supabase
        .from('compliance_alerts')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) return apiError('Failed to fetch compliance alerts', 500);
      return apiSuccess(data || []);
    }

    const [appsRes, offersRes, lendersRes, dealsRes] = await Promise.all([
      supabase.from('applications').select('id, status, submitted_at'),
      supabase.from('offers').select('id, decision_at'),
      supabase.from('lenders').select('id, is_active'),
      supabase.from('deals').select('status, amount'),
    ]);

    if (appsRes.error || offersRes.error || lendersRes.error || dealsRes.error) {
      return apiError('Failed to fetch platform stats', 500);
    }

    const apps = appsRes.data || [];
    const offers = offersRes.data || [];
    const lenders = lendersRes.data || [];
    const deals = dealsRes.data || [];
    const today = new Date().toISOString().slice(0, 10);

    return apiSuccess({
      totalApplications: apps.length,
      pendingApplications: apps.filter((app) => app.status === 'pending_decision').length,
      totalOffers: offers.length,
      totalLenders: lenders.length,
      activeLenders: lenders.filter((lender) => lender.is_active).length,
      totalDealsFunded: deals.filter((deal) => deal.status === 'funded').length,
      totalVolumeFunded: deals
        .filter((deal) => deal.status === 'funded')
        .reduce((sum, deal) => sum + Number(deal.amount || 0), 0),
      avgApprovalRate: apps.length
        ? Math.round(
            (apps.filter((app) => ['offers_available', 'conditional', 'funded'].includes(app.status)).length / apps.length) * 100
          )
        : 0,
      appsToday: apps.filter((app) => String(app.submitted_at).slice(0, 10) === today).length,
      offersToday: offers.filter((offer) => String(offer.decision_at).slice(0, 10) === today).length,
      fundedThisWeek: deals.filter((deal) => deal.status === 'funded').length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    console.error('Failed to fetch stats:', error);
    return apiError(message, 500);
  }
}
