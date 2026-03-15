import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { dbUpdateApplication } from '@/lib/db';
import { getOwnedApplicationForRequest } from '@/lib/application-ownership';
import { logServerError } from '@/lib/server-logger';
import { z } from 'zod';

const updateApplicationSchema = z.object({
  status: z.enum(['pending_decision', 'offers_available', 'conditional', 'funded', 'declined']).optional(),
  notes: z.string().max(1000).optional(),
  offersReceived: z.number().int().min(0).optional(),
});

// GET /api/applications/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { application, error } = await getOwnedApplicationForRequest(_req, id);
    if (error) return error;
    if (!application) return apiError('Access denied', 403);

    return apiSuccess(application);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/applications/[id]', action: 'GET', metadata: { applicationId: (await params).id } });
    return apiError('Failed to fetch application', 500);
  }
}

// PATCH /api/applications/[id] — update application status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { data, error } = await parseBody(req, updateApplicationSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { id } = await params;
    const { application, error: ownershipError } = await getOwnedApplicationForRequest(req, id);
    if (ownershipError) return ownershipError;
    if (!application) return apiError('Access denied', 403);

    const updated = await dbUpdateApplication(id, data);
    if (!updated) return apiError('Application not found', 404);
    return apiSuccess(updated);
  } catch (error: unknown) {
    logServerError(error, { route: '/api/applications/[id]', action: 'PATCH', metadata: { applicationId: (await params).id } });
    return apiError('Failed to update application', 500);
  }
}
