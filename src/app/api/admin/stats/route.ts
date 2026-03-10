import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetPlatformStats, dbGetActivityEvents, dbGetComplianceAlerts } from '@/lib/db';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
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
  } catch {
    return apiError('Failed to fetch stats', 500);
  }
}
