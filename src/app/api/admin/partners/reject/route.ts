import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody, requireAuth } from '@/lib/api-helpers';
import { decidePartnerApplication, getPartnerApplicationDetail, logPartnerApplicationFailure } from '@/lib/partner-applications';
import { serverLogger } from '@/lib/server-logger';

const rejectPartnerSchema = z.object({
  type: z.enum(['lender', 'dealer']),
  applicationId: z.string().min(1),
}).strict();

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  const { data, error } = await parseBody(request, rejectPartnerSchema);
  if (error) return error;
  if (!data) return apiError('Invalid request', 400);

  try {
    const detail = await getPartnerApplicationDetail(data.applicationId);
    if (!detail || detail.type !== data.type) {
      return apiError('Application not found', 404);
    }

    const result = await decidePartnerApplication(data.applicationId, { status: 'rejected' });

    serverLogger.info('Partner rejection completed', {
      applicationId: data.applicationId,
      email: result.application.email,
      type: data.type,
    });

    return apiSuccess({
      application: result.application,
    });
  } catch (routeError) {
    logPartnerApplicationFailure('Partner reject route failed', {
      applicationId: data.applicationId,
      error: routeError instanceof Error ? routeError.message : String(routeError),
      type: data.type,
    });
    return apiError('Unable to reject application', 500);
  }
}
