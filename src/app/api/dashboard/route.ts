import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { useMockData as shouldUseMockData } from '@/lib/env';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { MOCK_APPLICATIONS, MOCK_OFFERS } from '@/lib/mock-data';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import { serverLogger } from '@/lib/server-logger';
import { normalizeApplicationStatus } from '@/lib/application-status';
import { checkOfferExpiration, expireOffer } from '@/lib/offer-expiration';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value;

  if (!token) {
    return apiError('Missing session token', 401);
  }

  try {
    if (shouldUseMockData()) {
      const app = MOCK_APPLICATIONS.find((application) => (application as unknown as { sessionToken?: string }).sessionToken === token);
      if (!app) {
        return apiError('Session expired or invalid', 401);
      }

      const expiration = checkOfferExpiration(app);
      if (app.lockedOfferId && expiration.expired) {
        const updatedApplication = await expireOffer(app.id);
        if (updatedApplication) {
          app.status = updatedApplication.status;
          app.lockedOfferId = updatedApplication.lockedOfferId ?? null;
          app.offerLockedAt = updatedApplication.offerLockedAt ?? null;
          app.offerExpiresAt = updatedApplication.offerExpiresAt ?? null;
        }
      }

      const lockedOffer = app.lockedOfferId
        ? MOCK_OFFERS.find((offer) => offer.id === app.lockedOfferId) ?? null
        : null;

      return apiSuccess({
        application: {
          id: app.id,
          status: normalizeApplicationStatus(app.status),
          borrower: app.borrower,
          loanAmount: app.loanAmount,
          hasVehicle: app.hasVehicle,
          vehicle: app.vehicle,
          offersReceived: app.offersReceived || 0,
          submittedAt: app.submittedAt,
          lockedOfferId: app.lockedOfferId || null,
          offerLockedAt: app.offerLockedAt || null,
          offerExpiresAt: app.offerExpiresAt || null,
          lockedOffer: lockedOffer
            ? {
                id: lockedOffer.id,
                lenderName: lockedOffer.lenderName,
                apr: lockedOffer.apr,
                monthlyPayment: lockedOffer.monthlyPayment,
                approvedAmount: lockedOffer.approvedAmount,
                termMonths: lockedOffer.termMonths,
                status: lockedOffer.status,
              }
            : null,
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

    const expiration = checkOfferExpiration({
      id: application.id as string,
      lockedOfferId: application.locked_offer_id as string | null,
      offerExpiresAt: application.offer_expires_at as string | null,
    });

    if ((application.locked_offer_id as string | null) && expiration.expired) {
      const updatedApplication = await expireOffer(application.id as string);
      if (updatedApplication) {
        application.status = updatedApplication.status;
        application.locked_offer_id = updatedApplication.lockedOfferId ?? null;
        application.offer_locked_at = updatedApplication.offerLockedAt ?? null;
        application.offer_expires_at = updatedApplication.offerExpiresAt ?? null;
      }
    }

    const offerLookupId = application.locked_offer_id as string | null;
    const offerQuery = offerLookupId
      ? supabase.from('offers').select('*').eq('id', offerLookupId).maybeSingle()
      : supabase
          .from('offers')
          .select('*')
          .eq('application_id', application.id)
          .in('status', ['locked', 'selected'])
          .maybeSingle();

    const { data: lockedOffer, error: offerError } = await offerQuery;

    if (offerError) {
      return apiError('Failed to load dashboard', 500);
    }

    return apiSuccess({
      application: {
        id: application.id,
        status: normalizeApplicationStatus(String(application.status)),
        borrower: application.borrower,
        loanAmount: application.loan_amount,
        hasVehicle: application.has_vehicle ?? false,
        vehicle: application.vehicle,
        offersReceived: application.offers_received || 0,
        submittedAt: application.submitted_at,
        lockedOfferId: application.locked_offer_id ?? null,
        offerLockedAt: application.offer_locked_at ?? null,
        offerExpiresAt: application.offer_expires_at ?? null,
        lockedOffer: lockedOffer
          ? {
              id: lockedOffer.id,
              lenderName: lockedOffer.lender_name,
              apr: Number(lockedOffer.apr || 0),
              monthlyPayment: Number(lockedOffer.monthly_payment || 0),
              approvedAmount: Number(lockedOffer.approved_amount || 0),
              termMonths: Number(lockedOffer.term_months || 0),
              status: lockedOffer.status,
            }
          : null,
      },
    });
  } catch (err) {
    serverLogger.error('Dashboard API error', { error: err instanceof Error ? err.message : String(err) });
    return apiError('Failed to load dashboard', 500);
  }
}
