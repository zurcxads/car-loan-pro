import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api-helpers';
import { dbGetApplication, dbUpdateApplication } from '@/lib/db';
import { z } from 'zod';

const updateApplicationSchema = z.object({
  status: z.enum(['draft', 'submitted', 'reviewing', 'decisioned', 'conditional', 'docs_pending', 'funded', 'declined', 'cancelled']).optional(),
  notes: z.string().max(1000).optional(),
  offersReceived: z.number().int().min(0).optional(),
});

// GET /api/applications/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const app = await dbGetApplication(id);
    if (!app) return apiError('Application not found', 404);

    // TODO: Add ownership check - users should only see their own applications
    // unless they are admin/lender/dealer with permissions

    return apiSuccess(app);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch application';
    console.error('Failed to fetch application:', error);
    return apiError(message, 500);
  }
}

// PATCH /api/applications/[id] — update application status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(req, updateApplicationSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const { id } = await params;

    // TODO: Add ownership check - users should only update their own applications
    // unless they are admin/lender/dealer with permissions

    const updated = await dbUpdateApplication(id, data);
    if (!updated) return apiError('Application not found', 404);
    return apiSuccess(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update application';
    console.error('Failed to update application:', error);
    return apiError(message, 500);
  }
}
