import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { getServiceClient } from '@/lib/db';
import {
  approveApplicationSchema,
  buildLenderDecisionMetadata,
  getOwnedApplicationForLenderDecision,
  updateApplicationRecord,
  updateOfferRecord,
} from '@/lib/lender-decision-actions';
import { serverLogger } from '@/lib/server-logger';

const ROUTE_PATH = '/api/lender/applications/[id]/approve';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error: authError } = await requireAuth('lender');
  if (authError) {
    return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: authError.status });
  }

  const lenderId = session?.user.entityId;
  if (!lenderId) {
    serverLogger.error('Lender approval denied: missing lender entity id', {
      route: ROUTE_PATH,
      userId: session?.user.id,
    });
    return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 403 });
  }

  try {
    getServiceClient();
    const body = await request.json().catch(() => null);
    const parsedBody = approveApplicationSchema.safeParse(body);
    if (!parsedBody.success || parsedBody.data.lenderId !== lenderId) {
      serverLogger.warn('Lender approval validation failed', {
        issues: parsedBody.success ? [] : parsedBody.error.issues,
        lenderId,
        route: ROUTE_PATH,
      });
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 400 });
    }

    const { id: applicationId } = await params;
    const ownedApplication = await getOwnedApplicationForLenderDecision(lenderId, applicationId);
    if (!ownedApplication) {
      serverLogger.warn('Lender approval denied: application not owned by lender', {
        applicationId,
        lenderId,
        route: ROUTE_PATH,
      });
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 403 });
    }

    const updatedOffer = await updateOfferRecord(ownedApplication.lockedOffer.id, {
      decisionAt: new Date().toISOString(),
      status: 'approved',
    });

    if (!updatedOffer) {
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
    }

    const nextMetadata = buildLenderDecisionMetadata(
      ownedApplication.application.metadata,
      {
        lenderId,
        lenderName: ownedApplication.lockedOffer.lenderName,
      },
      {
        details: parsedBody.data.notes ? { notes: parsedBody.data.notes } : undefined,
        message: parsedBody.data.notes
          ? `Application approved. ${parsedBody.data.notes}`
          : 'Application approved.',
        type: 'lender_approved',
      }
    );

    const updatedApplication = await updateApplicationRecord(applicationId, {
      metadata: nextMetadata,
      status: 'approved',
    });

    if (!updatedApplication) {
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: {
        applicationId,
        offerId: updatedOffer.id,
        offerStatus: updatedOffer.status,
        status: updatedApplication.status,
      },
    });
  } catch (error) {
    serverLogger.error('Lender approval route failed', {
      error: error instanceof Error ? error.message : String(error),
      route: ROUTE_PATH,
    });
    return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
  }
}
