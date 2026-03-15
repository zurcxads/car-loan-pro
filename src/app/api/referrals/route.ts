import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api-helpers';
import { serverLogger } from '@/lib/server-logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user's referral code
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get referral stats
    const { data: referrals, error: refError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_code', user.referral_code)
      .order('created_at', { ascending: false });

    if (refError) {
      serverLogger.error('Referrals fetch error', { error: refError instanceof Error ? refError.message : String(refError) });
      return NextResponse.json(
        { error: 'Failed to fetch referrals' },
        { status: 500 }
      );
    }

    const stats = {
      totalInvites: referrals?.length || 0,
      applied: referrals?.filter(r => r.status === 'applied' || r.status === 'funded').length || 0,
      funded: referrals?.filter(r => r.status === 'funded').length || 0,
      totalRewards: referrals?.filter(r => r.status === 'funded').reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0,
      paidRewards: referrals?.filter(r => r.reward_paid).reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0,
    };

    return NextResponse.json({
      referralCode: user.referral_code,
      referrals: referrals || [],
      stats,
    });
  } catch (error) {
    serverLogger.error('Referrals API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}
