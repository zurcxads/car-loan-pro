import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetApplication, dbUpdateApplication } from '@/lib/db';

// GET /api/applications/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const app = await dbGetApplication(params.id);
    if (!app) return apiError('Application not found', 404);
    return apiSuccess(app);
  } catch {
    return apiError('Failed to fetch application', 500);
  }
}

// PATCH /api/applications/[id] — update application status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await dbUpdateApplication(params.id, body);
    if (!updated) return apiError('Application not found', 404);
    return apiSuccess(updated);
  } catch {
    return apiError('Failed to update application', 500);
  }
}
