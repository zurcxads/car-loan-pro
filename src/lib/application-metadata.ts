import type { ApplicationMetadata, ApplicationNotification, ApplicationNotificationType } from '@/lib/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeApplicationMetadata(metadata: unknown): ApplicationMetadata {
  if (!isRecord(metadata)) {
    return {};
  }

  const notifications = Array.isArray(metadata.notifications)
    ? metadata.notifications.filter((notification): notification is ApplicationNotification => {
      if (!isRecord(notification)) {
        return false;
      }

      return (
        typeof notification.id === 'string' &&
        notification.type === 'documents_uploaded' &&
        typeof notification.applicationId === 'string' &&
        typeof notification.message === 'string' &&
        typeof notification.createdAt === 'string' &&
        (notification.readAt === undefined || notification.readAt === null || typeof notification.readAt === 'string')
      );
    })
    : [];

  const counterOffer = isRecord(metadata.counterOffer) && isRecord(metadata.counterOffer.terms) && typeof metadata.counterOffer.updatedAt === 'string'
    ? {
      terms: metadata.counterOffer.terms,
      updatedAt: metadata.counterOffer.updatedAt,
    }
    : undefined;

  return {
    ...(counterOffer ? { counterOffer } : {}),
    ...(notifications.length > 0 ? { notifications } : {}),
  };
}

export function countUnreadApplicationNotifications(metadata: ApplicationMetadata | undefined): number {
  return normalizeApplicationMetadata(metadata).notifications?.filter((notification) => !notification.readAt).length ?? 0;
}

export function appendApplicationNotification(
  metadata: ApplicationMetadata | undefined,
  notification: {
    applicationId: string;
    message: string;
    type: ApplicationNotificationType;
  }
): ApplicationMetadata {
  const normalizedMetadata = normalizeApplicationMetadata(metadata);
  const notifications = normalizedMetadata.notifications ?? [];

  return {
    ...normalizedMetadata,
    notifications: [
      ...notifications,
      {
        id: crypto.randomUUID(),
        applicationId: notification.applicationId,
        createdAt: new Date().toISOString(),
        message: notification.message,
        type: notification.type,
      },
    ],
  };
}
