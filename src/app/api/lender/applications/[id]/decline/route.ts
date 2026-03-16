import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { getServiceClient } from '@/lib/db';
import {
  buildLenderDecisionMetadata,
  declineApplicationSchema,
  getOwnedApplicationForLenderDecision,
  updateApplicationRecord,
  updateOfferRecord,
} from '@/lib/lender-decision-actions';
import { serverLogger } from '@/lib/server-logger';

const ROUTE_PATH = '/api/lender/applications/[id]/decline';

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
    serverLogger.error('Lender decline denied: missing lender entity id', {
      route: ROUTE_PATH,
      userId: session?.user.id,
    });
    return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 403 });
  }

  try {
    getServiceClient();
    const body = await request.json().catch(() => null);
    const parsedBody = declineApplicationSchema.safeParse(body);
    if (!parsedBody.success || parsedBody.data.lenderId !== lenderId) {
      serverLogger.warn('Lender decline validation failed', {
        issues: parsedBody.success ? [] : parsedBody.error.issues,
        lenderId,
        route: ROUTE_PATH,
      });
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 400 });
    }

    const { id: applicationId } = await params;
    const ownedApplication = await getOwnedApplicationForLenderDecision(lenderId, applicationId);
    if (!ownedApplication) {
      serverLogger.warn('Lender decline denied: application not owned by lender', {
        applicationId,
        lenderId,
        route: ROUTE_PATH,
      });
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 403 });
    }

    const updatedOffer = await updateOfferRecord(ownedApplication.lockedOffer.id, {
      decisionAt: new Date().toISOString(),
      lockedAt: null,
      status: 'declined',
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
        details: parsedBody.data.reason ? { reason: parsedBody.data.reason } : undefined,
        message: parsedBody.data.reason
          ? `Application declined. ${parsedBody.data.reason}`
          : 'Application declined.',
        type: 'lender_declined',
      }
    );

    const updatedApplication = await updateApplicationRecord(applicationId, {
      lockedOfferId: null,
      metadata: nextMetadata,
      offerExpiresAt: null,
      offerLockedAt: null,
      status: 'declined',
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
    serverLogger.error('Lender decline route failed', {
      error: error instanceof Error ? error.message : String(error),
      route: ROUTE_PATH,
    });
    return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
  }
}
