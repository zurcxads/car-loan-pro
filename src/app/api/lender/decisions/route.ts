import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, requireAuth } from '@/lib/api-helpers';
import { normalizeApplicationMetadata } from '@/lib/application-metadata';
import { sendOfferApprovedEmail, sendOfferDeclinedEmail } from '@/lib/consumer-notifications';
import { dbCreateActivityEvent, dbUpdateApplication, dbUpdateOffer } from '@/lib/db';
import { getLenderActiveApplication } from '@/lib/lender-applications';
import type { MockApplication } from '@/lib/mock-data';
import { serverLogger } from '@/lib/server-logger';

const lenderDecisionRequestSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(['approve', 'decline', 'counter', 'request_docs']),
  terms: z.record(z.string(), z.unknown()).optional(),
}).strict();

const statusByAction: Record<
  z.infer<typeof lenderDecisionRequestSchema>['action'],
  MockApplication['status']
> = {
  approve: 'approved',
  decline: 'declined',
  counter: 'under_review',
  request_docs: 'documents_requested',
};

export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAuth('lender');
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = lenderDecisionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Invalid request body', 422);
  }

  const { applicationId, action, terms } = parsed.data;
  const lenderId = session?.user.entityId;

  if (!lenderId) {
    return apiError('Lender account is missing an entity ID', 403);
  }

  try {
    const ownedApplication = await getLenderActiveApplication(lenderId, applicationId);
    const application = ownedApplication?.application;

    if (!application) {
      return apiError('Application not found', 404);
    }

    const nextStatus = statusByAction[action];
    const nextFlags = action === 'request_docs'
      ? Array.from(new Set([...application.flags, 'docs_requested']))
      : application.flags.filter((flag) => flag !== 'docs_requested');
    const applicationMetadata = normalizeApplicationMetadata(application.metadata);
    const nextMetadata = (() => {
      if (action === 'counter') {
        return {
          ...applicationMetadata,
          counterOffer: {
            terms: terms ?? {},
            updatedAt: new Date().toISOString(),
          },
        };
      }

      if (!applicationMetadata.counterOffer) {
        return applicationMetadata;
      }

      return {
        ...applicationMetadata,
        counterOffer: undefined,
      };
    })();

    if (action === 'decline' && application.lockedOfferId) {
      await dbUpdateOffer(application.lockedOfferId, {
        status: 'declined',
        lockedAt: null,
      });
    }

    const updatedApplication = await dbUpdateApplication(applicationId, {
      status: nextStatus,
      flags: nextFlags,
      lockedOfferId: action === 'decline' ? null : application.lockedOfferId,
      offerLockedAt: action === 'decline' ? null : application.offerLockedAt,
      offerExpiresAt: action === 'decline' ? null : application.offerExpiresAt,
      metadata: nextMetadata,
    });

    if (!updatedApplication) {
      return apiError('Failed to update application', 500);
    }

    const termsSummary = terms ? ` Terms: ${JSON.stringify(terms)}.` : '';
    const lenderName = ownedApplication?.lockedOffer.lenderName || session?.user.name || 'Your lender';
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

    await dbCreateActivityEvent({
      type: action === 'decline' ? 'declined' : 'system',
      timestamp: new Date().toISOString(),
      description: `${session?.user.name || 'Lender'} set ${applicationId} to ${action}.${termsSummary}`,
    });

    if (action === 'approve') {
      const emailResult = await sendOfferApprovedEmail(application.borrower.email, lenderName, dashboardUrl);
      if (!emailResult.success) {
        serverLogger.error('Failed to send consumer approval email', {
          applicationId,
          email: application.borrower.email,
        });
      }
    }

    if (action === 'decline') {
      const emailResult = await sendOfferDeclinedEmail(application.borrower.email, dashboardUrl);
      if (!emailResult.success) {
        serverLogger.error('Failed to send consumer decline email', {
          applicationId,
          email: application.borrower.email,
        });
      }
    }

    return Response.json({
      success: true,
      applicationId,
      action,
      status: updatedApplication.status,
      terms: terms || null,
    });
  } catch (error) {
    serverLogger.error('Lender decision error', { error: error instanceof Error ? error.message : String(error) });
    return apiError('Failed to process lender decision', 500);
  }
}
