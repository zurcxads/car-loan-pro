import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetOffersByApplication } from '@/lib/db';
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
    if (!isSupabaseConfigured()) {
      // Fallback to mock data - find by session token
      const app = MOCK_APPLICATIONS.find(a => (a as unknown as { sessionToken?: string }).sessionToken === token);

      if (!app) {
        return apiError('Session expired or invalid', 401);
      }

      const selectedOffer = await dbGetOffersByApplication(app.id)
        .then((offers) => offers.find((offer) => offer.status === 'selected') || null);

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
          selectedOffer,
        }
      });
    }

    // Query application by session token using service role client
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('session_token', token)
      .gt('session_expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return apiError('Session expired or invalid', 401);
    }

    // Return application data for dashboard
    const selectedOffer = await dbGetOffersByApplication(data.id)
      .then((offers) => offers.find((offer) => offer.status === 'selected') || null);

    return apiSuccess({
      application: {
        id: data.id,
        status: data.status,
        borrower: data.borrower,
        loanAmount: data.loan_amount,
        hasVehicle: data.has_vehicle ?? false,
        vehicle: data.vehicle,
        offersReceived: data.offers_received || 0,
        submittedAt: data.submitted_at,
        selectedOffer,
      }
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return apiError('Failed to load dashboard', 500);
  }
}
