import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbMarkNotificationRead } from '@/lib/db';

// PATCH /api/notifications/[id]/read — mark a notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  try {
    // TODO: Add ownership check - verify notification belongs to the authenticated user
    // This requires dbGetNotification to return the notification with user_id
    // For now, we'll add a comment as a reminder

    await dbMarkNotificationRead(id);
    return apiSuccess({ message: 'Notification marked as read' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
    console.error('Failed to mark notification as read:', error);
    return apiError(message, 500);
  }
}
