import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { useMockData } from '@/lib/env';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_APPLICATIONS } from '@/lib/mock-data';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value || searchParams.get('token');

  if (!token) {
    return apiError('Missing session token', 401);
  }

  try {
    if (useMockData()) {
      const app = MOCK_APPLICATIONS.find((application) => (application as unknown as { sessionToken?: string }).sessionToken === token);
      if (!app) {
        return apiError('Session expired or invalid', 401);
      }

      return apiSuccess({
        application: {
          id: app.id,
          status: app.status,
          borrower: app.borrower,
          loanAmount: app.loanAmount,
          hasVehicle: app.hasVehicle,
          vehicle: app.vehicle,
          offersReceived: app.offersReceived || 0,
          submittedAt: app.submittedAt,
          selectedOffer: null,
        },
      });
    }
    if (!isSupabaseConfigured()) {
      return apiError('Dashboard unavailable: Supabase is not configured', 503);
    }

    const supabase = getServiceClient();
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select('*')
      .eq('session_token', token)
      .gt('session_expires_at', new Date().toISOString())
      .single();

    if (applicationError || !application) {
      return apiError('Session expired or invalid', 401);
    }

    const { data: selectedOffer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('application_id', application.id)
      .eq('status', 'selected')
      .maybeSingle();

    if (offerError) {
      return apiError('Failed to load dashboard', 500);
    }

    return apiSuccess({
      application: {
        id: application.id,
        status: application.status,
        borrower: application.borrower,
        loanAmount: application.loan_amount,
        hasVehicle: application.has_vehicle ?? false,
        vehicle: application.vehicle,
        offersReceived: application.offers_received || 0,
        submittedAt: application.submitted_at,
        selectedOffer: selectedOffer
          ? {
              id: selectedOffer.id,
              lenderName: selectedOffer.lender_name,
              apr: Number(selectedOffer.apr || 0),
              approvedAmount: Number(selectedOffer.approved_amount || 0),
            }
          : null,
      },
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return apiError('Failed to load dashboard', 500);
  }
}
