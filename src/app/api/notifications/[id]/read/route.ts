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
    await dbMarkNotificationRead(id);
    return apiSuccess({ message: 'Notification marked as read' });
  } catch {
    return apiError('Failed to mark notification as read', 500);
  }
}
