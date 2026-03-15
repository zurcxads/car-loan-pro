import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, requireAuth } from '@/lib/api-helpers';
import { dbCreateActivityEvent, dbGetApplication, dbUpdateApplication } from '@/lib/db';
import type { MockApplication } from '@/lib/mock-data';

const lenderDecisionRequestSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(['approve', 'decline', 'counter', 'request_docs']),
  terms: z.record(z.string(), z.unknown()).optional(),
}).strict();

const statusByAction: Record<
  z.infer<typeof lenderDecisionRequestSchema>['action'],
  MockApplication['status']
> = {
  approve: 'offers_available',
  decline: 'declined',
  counter: 'conditional',
  request_docs: 'pending_decision',
};

export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAuth('lender');
  if (authError) return authError;
  void session;

  const body = await req.json().catch(() => null);
  const parsed = lenderDecisionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Invalid request body', 422);
  }

  const { applicationId, action, terms } = parsed.data;

  try {
    const application = await dbGetApplication(applicationId);

    if (!application) {
      return apiError('Application not found', 404);
    }

    const nextStatus = statusByAction[action];
    const nextFlags = action === 'request_docs'
      ? Array.from(new Set([...application.flags, 'docs_requested']))
      : application.flags.filter((flag) => flag !== 'docs_requested');

    const updatedApplication = await dbUpdateApplication(applicationId, {
      status: nextStatus,
      flags: nextFlags,
    });

    if (!updatedApplication) {
      return apiError('Failed to update application', 500);
    }

    const termsSummary = terms ? ` Terms: ${JSON.stringify(terms)}.` : '';

    await dbCreateActivityEvent({
      type: action === 'decline' ? 'declined' : 'system',
      timestamp: new Date().toISOString(),
      description: `${session?.user.name || 'Lender'} set ${applicationId} to ${action}.${termsSummary}`,
    });

    return Response.json({
      success: true,
      applicationId,
      action,
      status: updatedApplication.status,
      terms: terms || null,
    });
  } catch (error) {
    console.error('Lender decision error:', error);
    return apiError('Failed to process lender decision', 500);
  }
}
