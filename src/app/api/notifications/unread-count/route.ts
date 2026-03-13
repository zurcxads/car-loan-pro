import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetUnreadNotificationCount } from '@/lib/db';

// GET /api/notifications/unread-count?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return apiError('userId is required', 400);
    }

    const count = await dbGetUnreadNotificationCount(userId);

    return apiSuccess({ count });
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    return apiError('Failed to fetch unread count', 500);
  }
}
