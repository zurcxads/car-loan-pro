import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/dealers/[dealerId]/buyers — get selected consumers visible to this dealer
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  const { session, error } = await requireAuth('dealer');
  if (error) return error;

  const { dealerId } = await params;
  if (dealerId !== session?.user.entityId) {
    return apiError('You can only view buyers for your own dealership', 403);
  }

  try {
    if (!isSupabaseConfigured()) {
      return apiError('Supabase is not configured', 503);
    }

    const supabase = getServiceClient();
    const { data: selectedOffers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('status', 'selected')
      .order('decision_at', { ascending: false });
    if (offersError) {
      return apiError('Failed to fetch buyers', 500);
    }

    const applicationIds = Array.from(new Set((selectedOffers || []).map((offer) => offer.application_id).filter(Boolean)));
    if (applicationIds.length === 0) {
      return apiSuccess({ buyers: [] });
    }

    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .in('id', applicationIds);
    if (applicationsError) {
      return apiError('Failed to fetch buyers', 500);
    }

    const applicationsById = new Map((applications || []).map((application) => [application.id, application]));
    const buyers = (selectedOffers || [])
      .map((offer) => {
        const application = applicationsById.get(offer.application_id);
        if (!application) return null;

        return {
          application: {
            id: application.id,
            borrower: application.borrower,
            employment: application.employment,
            credit: application.credit,
            vehicle: application.vehicle,
            dealStructure: application.deal_structure,
            loanAmount: application.loan_amount ? Number(application.loan_amount) : undefined,
            ltvPercent: application.ltv_percent ? Number(application.ltv_percent) : undefined,
            dtiPercent: Number(application.dti_percent || 0),
            ptiPercent: application.pti_percent ? Number(application.pti_percent) : undefined,
            hasVehicle: Boolean(application.has_vehicle),
            status: application.status,
            state: application.state,
            submittedAt: application.submitted_at,
            updatedAt: application.updated_at,
            lendersSubmitted: Number(application.lenders_submitted || 0),
            offersReceived: Number(application.offers_received || 0),
            flags: application.flags || [],
          },
          selectedOffer: {
            id: offer.id,
            applicationId: offer.application_id,
            lenderId: offer.lender_id,
            lenderName: offer.lender_name,
            apr: Number(offer.apr || 0),
            termMonths: Number(offer.term_months || 0),
            monthlyPayment: Number(offer.monthly_payment || 0),
            approvedAmount: Number(offer.approved_amount || 0),
            status: offer.status,
            conditions: offer.conditions || [],
            decisionAt: offer.decision_at,
            expiresAt: offer.expires_at,
          },
          buyer: {
            firstName: application.borrower.firstName,
            lastInitial: application.borrower.lastName[0],
            city: application.borrower.city,
            state: application.borrower.state,
            zip: application.borrower.zip,
            approvedAmount: Number(offer.approved_amount || 0),
            lenderName: offer.lender_name || '',
            status: 'selected',
          },
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.selectedOffer?.approvedAmount || 0) - (a?.selectedOffer?.approvedAmount || 0));

    return apiSuccess({ buyers });
  } catch {
    return apiError('Failed to fetch buyers', 500);
  }
}
