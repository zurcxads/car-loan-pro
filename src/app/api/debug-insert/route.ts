import { NextResponse } from 'next/server';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured', configured: false });
  }

  try {
    const db = getServiceClient();
    
    const testData = {
      borrower: { firstName: 'Debug', lastName: 'Test' },
      employment: { status: 'full_time', grossMonthlyIncome: 5000 },
      credit: { ficoScore: 700, scoreTier: 'prime' },
      status: 'pending_decision',
      state: 'TX',
      has_vehicle: false,
      dti_percent: 20,
      lenders_submitted: 0,
      offers_received: 0,
      session_token: 'debug-' + Date.now(),
      session_expires_at: new Date(Date.now() + 86400000).toISOString(),
    };

    const { data, error } = await db.from('applications').insert(testData).select().single();

    if (error) {
      return NextResponse.json({ 
        error: error.message, 
        details: error.details, 
        hint: error.hint, 
        code: error.code,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30),
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      });
    }

    // Clean up test record
    if (data?.id) {
      await db.from('applications').delete().eq('id', data.id);
    }

    return NextResponse.json({ success: true, id: data?.id, cleaned: true });
  } catch (err) {
    return NextResponse.json({ 
      error: String(err),
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30),
    });
  }
}
