import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetNotifications, dbGetUnreadNotificationCount, dbMarkAllNotificationsRead } from '@/lib/db';

// GET /api/notifications — get user's notifications
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session) return apiError('Unauthorized', 401);

  try {
    const notifications = await dbGetNotifications(session.user.id);
    const unreadCount = await dbGetUnreadNotificationCount(session.user.id);

    return apiSuccess({ notifications, unreadCount });
  } catch {
    return apiError('Failed to fetch notifications', 500);
  }
}

// POST /api/notifications/mark-all-read
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;
  if (!session) return apiError('Unauthorized', 401);

  try {
    await dbMarkAllNotificationsRead(session.user.id);
    return apiSuccess({ message: 'All notifications marked as read' });
  } catch {
    return apiError('Failed to mark notifications as read', 500);
  }
}
