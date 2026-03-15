import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetUnreadNotificationCount } from '@/lib/db';
import { serverLogger } from '@/lib/server-logger';

export const dynamic = 'force-dynamic';

// GET /api/notifications/unread-count?userId=xxx
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return apiError('userId is required', 400);
    }

    const count = await dbGetUnreadNotificationCount(userId);

    return apiSuccess({ count });
  } catch (error) {
    serverLogger.error('Failed to fetch unread count', { error: error instanceof Error ? error.message : String(error) });
    return apiError('Failed to fetch unread count', 500);
  }
}
