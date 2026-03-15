import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody, requireAuth } from '@/lib/api-helpers';
import {
  decidePartnerApplication,
  getPartnerApplicationDetail,
  logPartnerApplicationFailure,
} from '@/lib/partner-applications';

const updateStatusSchema = z.object({
  rejectionReason: z.string().max(1000).optional(),
  status: z.enum(['approved', 'rejected']),
}).strict();

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  try {
    const application = await getPartnerApplicationDetail(context.params.id);
    if (!application) {
      return apiError('Application not found', 404);
    }

    return apiSuccess({ application });
  } catch (error) {
    logPartnerApplicationFailure('Failed to fetch partner application detail', {
      applicationId: context.params.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError('Failed to fetch application details', 500);
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const { data, error } = await parseBody(req, updateStatusSchema);
  if (error) return error;
  if (!data) return apiError('Invalid request', 400);

  try {
    const result = await decidePartnerApplication(context.params.id, data);

    return apiSuccess({
      application: result.application,
      onboarding: {
        authUserId: result.authUserId,
        entityId: result.entityId,
        temporaryPassword: result.temporaryPassword,
      },
    });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : String(routeError);

    if (message === 'Application not found') {
      return apiError(message, 404);
    }

    logPartnerApplicationFailure('Failed to update partner application', {
      applicationId: context.params.id,
      error: message,
      status: data.status,
    });
    return apiError('Failed to update application', 500);
  }
}
