import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import { dbGetApplications } from '@/lib/db';

export async function GET() {
  const { error } = await requireAuth('dealer');
  if (error) return error;

  try {
    const applications = await dbGetApplications();
    return apiSuccess(applications);
  } catch {
    return apiError('Failed to fetch applications', 500);
  }
}
