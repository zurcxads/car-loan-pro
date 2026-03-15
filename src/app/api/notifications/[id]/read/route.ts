import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetNotification, dbMarkNotificationRead } from '@/lib/db';
import { logServerError } from '@/lib/server-logger';

// PATCH /api/notifications/[id]/read — mark a notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    const notification = await dbGetNotification(id);
    if (!notification) return apiError('Notification not found', 404);
    if (!session || notification.userId !== session.user.id) {
      return apiError('Access denied', 403);
    }

    await dbMarkNotificationRead(id);
    return apiSuccess({ message: 'Notification marked as read' });
  } catch (error: unknown) {
    logServerError(error, { route: '/api/notifications/[id]/read', action: 'PATCH', metadata: { notificationId: id } });
    return apiError('Failed to mark notification as read', 500);
  }
}
