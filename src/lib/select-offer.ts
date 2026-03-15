import { NextRequest, NextResponse } from 'next/server';
import { apiError, parseBody } from '@/lib/api-helpers';
import {
  dbGetApplicationByToken,
  dbGetOffer,
  dbGetOffers,
  dbUpdateApplication,
  dbUpdateOffer,
} from '@/lib/db';
import {
  CONSUMER_SESSION_COOKIE,
  getConsumerSessionCookieOptions,
} from '@/lib/consumer-session';
import { serverLogger } from '@/lib/server-logger';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { z } from 'zod';

export const selectOfferSchema = z.object({
  offerId: z.string().min(1),
  selectedTerm: z.number().int().positive(),
  selectedDownPayment: z.number().min(0),
});

export async function handleOfferSelection(req: NextRequest) {
  const { data, error } = await parseBody(req, selectOfferSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  const token = req.cookies.get(CONSUMER_SESSION_COOKIE)?.value;
  if (!token) {
    return apiError('Missing session token', 401);
  }

  try {
    const application = await dbGetApplicationByToken(token);
    if (!application) {
      return apiError('Invalid or expired token', 401);
    }

    const offer = await dbGetOffer(data.offerId);
    if (!offer || offer.applicationId !== application.id) {
      return apiError('Invalid offer', 400);
    }

    if (isSupabaseConfigured()) {
      const supabase = getServiceClient();

      const { error: selectError } = await supabase
        .from('offers')
        .update({ status: 'selected' })
        .eq('id', offer.id);
      if (selectError) return apiError('Failed to update selected offer', 500);

      const { error: declineError } = await supabase
        .from('offers')
        .update({ status: 'declined' })
        .eq('application_id', application.id)
        .neq('id', offer.id)
        .neq('status', 'declined');
      if (declineError) return apiError('Failed to update sibling offers', 500);

      const { error: applicationError } = await supabase
        .from('applications')
        .update({
          status: 'conditional',
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.id);
      if (applicationError) return apiError('Failed to update application', 500);

      const { error: linkError } = await supabase
        .from('application_lender_links')
        .upsert({
          application_id: application.id,
          lender_id: offer.lenderId,
          offer_id: offer.id,
          consumer_email: application.borrower.email,
          selected_term_months: data.selectedTerm,
          selected_down_payment: data.selectedDownPayment,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'application_id' });
      if (linkError) return apiError('Failed to link application to lender', 500);
    } else {
      await dbUpdateOffer(offer.id, { status: 'selected' });

      const siblingOffers = await dbGetOffers(application.id);
      await Promise.all(
        siblingOffers
          .filter((sibling) => sibling.id !== offer.id && sibling.status !== 'declined')
          .map((sibling) => dbUpdateOffer(sibling.id, { status: 'declined' }))
      );

      await dbUpdateApplication(application.id, {
        status: 'conditional',
        updatedAt: new Date().toISOString(),
      });
    }

    const response = NextResponse.json({
      success: true,
      data: {
        lenderName: offer.lenderName,
        offerId: offer.id,
        selectedTerm: data.selectedTerm,
        selectedDownPayment: data.selectedDownPayment,
      },
    });

    response.cookies.set(
      CONSUMER_SESSION_COOKIE,
      token,
      getConsumerSessionCookieOptions()
    );

    return response;
  } catch (err) {
    serverLogger.error('Offer selection error', { error: err instanceof Error ? err.message : String(err) });
    return apiError('Failed to select offer', 500);
  }
}
