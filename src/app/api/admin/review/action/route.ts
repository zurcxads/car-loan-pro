import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiError, requireAuth } from '@/lib/api-helpers';
import { dbCreateActivityEvent, dbGetApplication, dbUpdateApplication } from '@/lib/db';
import type { MockApplication } from '@/lib/mock-data';

const reviewActionSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(['approve', 'reject', 'flag', 'decline', 'request_info']),
}).strict();

function getReviewOutcome(
  application: MockApplication,
  action: z.infer<typeof reviewActionSchema>['action']
): Pick<MockApplication, 'status' | 'flags'> {
  if (action === 'approve') {
    return {
      status: 'offers_available',
      flags: application.flags.filter((flag) => flag !== 'manual_review'),
    };
  }

  if (action === 'reject' || action === 'decline') {
    return {
      status: 'declined',
      flags: application.flags.filter((flag) => flag !== 'manual_review'),
    };
  }

  return {
    status: 'pending_decision',
    flags: Array.from(new Set([...application.flags, 'manual_review'])),
  };
}

export async function POST(req: NextRequest) {
  const { session, error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const parsed = reviewActionSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message || 'Invalid review action', 422);
  }

  const { applicationId, action } = parsed.data;
  const application = await dbGetApplication(applicationId);

  if (!application) {
    return apiError('Application not found', 404);
  }

  const outcome = getReviewOutcome(application, action);
  const updatedApplication = await dbUpdateApplication(applicationId, outcome);

  if (!updatedApplication) {
    return apiError('Failed to update review status', 500);
  }

  await dbCreateActivityEvent({
    type: action === 'approve' ? 'offer' : action === 'flag' || action === 'request_info' ? 'system' : 'declined',
    timestamp: new Date().toISOString(),
    description: `${session?.user.name || 'Admin'} executed ${action} for ${applicationId}`,
  });

  return NextResponse.json({
    success: true,
    applicationId,
    action,
    status: updatedApplication.status,
    flags: updatedApplication.flags,
  });
}
