import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/lenders/[lenderId]/applications — get applications assigned to this lender
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lenderId: string }> }
) {
  const { session, error } = await requireAuth('lender');
  if (error) return error;

  const { lenderId } = await params;
  if (lenderId !== session?.user.entityId) {
    return apiError('You can only view applications for your own lender account', 403);
  }

  try {
    if (!isSupabaseConfigured()) {
      return apiError('Supabase is not configured', 503);
    }

    const supabase = getServiceClient();
    const { data: lender, error: lenderError } = await supabase
      .from('lenders')
      .select('*')
      .eq('id', lenderId)
      .single();
    if (lenderError || !lender) {
      return apiError('Lender not found', 404);
    }

    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .eq('lender_id', lenderId)
      .order('decision_at', { ascending: false });
    if (offersError) {
      return apiError('Failed to fetch lender applications', 500);
    }

    const applicationIds = Array.from(new Set((offers || []).map((offer) => offer.application_id).filter(Boolean)));
    if (applicationIds.length === 0) {
      return apiSuccess({ applications: [], lender });
    }

    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .in('id', applicationIds)
      .order('submitted_at', { ascending: false });
    if (applicationsError) {
      return apiError('Failed to fetch lender applications', 500);
    }

    const offersByApplication = new Map((offers || []).map((offer) => [offer.application_id, offer]));
    const mappedApplications = (applications || []).map((application) => ({
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
      assignedOffer: offersByApplication.get(application.id) || null,
    }));

    return apiSuccess({ applications: mappedApplications, lender });
  } catch {
    return apiError('Failed to fetch applications', 500);
  }
}
