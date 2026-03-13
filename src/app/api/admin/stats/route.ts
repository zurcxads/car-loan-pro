import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetPlatformStats, dbGetActivityEvents, dbGetComplianceAlerts } from '@/lib/db';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  // Require admin authentication
  const { session, error: authError } = await requireAuth('admin');
  if (authError) return authError;

  try {
    const type = req.nextUrl.searchParams.get('type');

    if (type === 'events') {
      const events = await dbGetActivityEvents();
      return apiSuccess(events);
    }

    if (type === 'compliance') {
      const alerts = await dbGetComplianceAlerts();
      return apiSuccess(alerts);
    }

    const stats = await dbGetPlatformStats();
    return apiSuccess(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    console.error('Failed to fetch stats:', error);
    return apiError(message, 500);
  }
}
