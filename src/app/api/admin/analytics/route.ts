import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  // Require admin authentication
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Applications per day
    const { data: dailyApps, error: appsError } = await supabase
      .from('applications')
      .select('submitted_at')
      .gte('submitted_at', startDate.toISOString());

    if (appsError) throw appsError;

    const appsByDay: Record<string, number> = {};
    dailyApps?.forEach(app => {
      const date = new Date(app.submitted_at).toISOString().split('T')[0];
      appsByDay[date] = (appsByDay[date] || 0) + 1;
    });

    const applicationsPerDay = Object.entries(appsByDay).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Offers per lender
    const { data: lenderOffers, error: offersError } = await supabase
      .from('offers')
      .select('lender_name');

    if (offersError) throw offersError;

    const offersByLender: Record<string, number> = {};
    lenderOffers?.forEach(offer => {
      offersByLender[offer.lender_name] = (offersByLender[offer.lender_name] || 0) + 1;
    });

    const offersPerLender = Object.entries(offersByLender).map(([lender, count]) => ({
      lender,
      count,
    }));

    // Conversion funnel
    const { data: allApps } = await supabase
      .from('applications')
      .select('id, offers_received, status');

    const funnelData = {
      started: allApps?.length || 0,
      completed: allApps?.filter(a => a.status !== 'draft').length || 0,
      offersReceived: allApps?.filter(a => a.offers_received > 0).length || 0,
      funded: allApps?.filter(a => a.status === 'funded').length || 0,
    };

    const conversionFunnel = [
      { stage: 'Started', count: funnelData.started },
      { stage: 'Completed', count: funnelData.completed },
      { stage: 'Offers', count: funnelData.offersReceived },
      { stage: 'Funded', count: funnelData.funded },
    ];

    // Approval rates by credit tier
    const { data: appsWithCredit } = await supabase
      .from('applications')
      .select('credit, status');

    const creditTiers: Record<string, { total: number; approved: number }> = {
      'Excellent (750+)': { total: 0, approved: 0 },
      'Good (700-749)': { total: 0, approved: 0 },
      'Fair (650-699)': { total: 0, approved: 0 },
      'Poor (600-649)': { total: 0, approved: 0 },
      'Very Poor (<600)': { total: 0, approved: 0 },
    };

    appsWithCredit?.forEach(app => {
      const score = app.credit?.ficoScore || 0;
      let tier = 'Very Poor (<600)';
      if (score >= 750) tier = 'Excellent (750+)';
      else if (score >= 700) tier = 'Good (700-749)';
      else if (score >= 650) tier = 'Fair (650-699)';
      else if (score >= 600) tier = 'Poor (600-649)';

      creditTiers[tier].total++;
      if (app.status === 'funded' || app.status === 'decisioned') {
        creditTiers[tier].approved++;
      }
    });

    const approvalRatesByTier = Object.entries(creditTiers).map(([tier, data]) => ({
      tier,
      rate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
      total: data.total,
    }));

    // Average APR trend
    const { data: offersWithDates } = await supabase
      .from('offers')
      .select('apr, decision_at')
      .gte('decision_at', startDate.toISOString());

    const aprByMonth: Record<string, { sum: number; count: number }> = {};
    offersWithDates?.forEach(offer => {
      const month = new Date(offer.decision_at).toISOString().slice(0, 7);
      if (!aprByMonth[month]) aprByMonth[month] = { sum: 0, count: 0 };
      aprByMonth[month].sum += offer.apr;
      aprByMonth[month].count++;
    });

    const avgAprTrend = Object.entries(aprByMonth).map(([month, data]) => ({
      month,
      avgApr: data.count > 0 ? (data.sum / data.count).toFixed(2) : 0,
    })).sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      applicationsPerDay,
      offersPerLender,
      conversionFunnel,
      approvalRatesByTier,
      avgAprTrend,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
