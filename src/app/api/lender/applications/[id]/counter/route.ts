import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-helpers';
import { getServiceClient } from '@/lib/db';
import {
  buildLenderDecisionMetadata,
  counterApplicationSchema,
  createCounterOfferRecord,
  getOwnedApplicationForLenderDecision,
  updateApplicationRecord,
  updateOfferRecord,
} from '@/lib/lender-decision-actions';
import { normalizeApplicationMetadata } from '@/lib/application-metadata';
import { serverLogger } from '@/lib/server-logger';

const ROUTE_PATH = '/api/lender/applications/[id]/counter';

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
    serverLogger.error('Lender counter denied: missing lender entity id', {
      route: ROUTE_PATH,
      userId: session?.user.id,
    });
    return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 403 });
  }

  try {
    getServiceClient();
    const body = await request.json().catch(() => null);
    const parsedBody = counterApplicationSchema.safeParse(body);
    if (!parsedBody.success || parsedBody.data.lenderId !== lenderId) {
      serverLogger.warn('Lender counter validation failed', {
        issues: parsedBody.success ? [] : parsedBody.error.issues,
        lenderId,
        route: ROUTE_PATH,
      });
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 400 });
    }

    const { id: applicationId } = await params;
    const ownedApplication = await getOwnedApplicationForLenderDecision(lenderId, applicationId);
    if (!ownedApplication) {
      serverLogger.warn('Lender counter denied: application not owned by lender', {
        applicationId,
        lenderId,
        route: ROUTE_PATH,
      });
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 403 });
    }

    const counterOffer = await createCounterOfferRecord(
      ownedApplication.application,
      ownedApplication.lockedOffer,
      parsedBody.data
    );

    if (!counterOffer) {
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
    }

    const archivedOffer = await updateOfferRecord(ownedApplication.lockedOffer.id, {
      status: 'expired',
    });

    if (!archivedOffer) {
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
    }

    const baseMetadata = normalizeApplicationMetadata(ownedApplication.application.metadata);
    const nextMetadata = buildLenderDecisionMetadata(
      {
        ...baseMetadata,
        counterOffer: {
          terms: {
            amount: parsedBody.data.amount,
            apr: parsedBody.data.apr,
            conditions: parsedBody.data.conditions ?? [],
            monthlyPayment: parsedBody.data.monthlyPayment,
            term: parsedBody.data.term,
          },
          updatedAt: new Date().toISOString(),
        },
      },
      {
        lenderId,
        lenderName: ownedApplication.lockedOffer.lenderName,
      },
      {
        details: {
          amount: parsedBody.data.amount,
          apr: parsedBody.data.apr,
          conditions: parsedBody.data.conditions ?? [],
          monthlyPayment: parsedBody.data.monthlyPayment,
          term: parsedBody.data.term,
        },
        message: `Counter offer created at ${parsedBody.data.apr.toFixed(2)}% APR for ${parsedBody.data.term} months.`,
        type: 'lender_countered',
      }
    );

    const updatedApplication = await updateApplicationRecord(applicationId, {
      lockedOfferId: counterOffer.id,
      metadata: nextMetadata,
      offerExpiresAt: counterOffer.expiresAt,
      offerLockedAt: new Date().toISOString(),
      status: 'under_review',
    });

    if (!updatedApplication) {
      return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: {
        applicationId,
        offerId: counterOffer.id,
        offerStatus: counterOffer.status,
        status: updatedApplication.status,
      },
    });
  } catch (error) {
    serverLogger.error('Lender counter route failed', {
      error: error instanceof Error ? error.message : String(error),
      route: ROUTE_PATH,
    });
    return Response.json({ success: false, error: 'Unable to process lender decision.' }, { status: 500 });
  }
}
