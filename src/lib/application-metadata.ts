import type {
  ApplicationMetadata,
  ApplicationMetadataMessage,
  ApplicationMetadataTimelineEntry,
  ApplicationNotification,
  ApplicationNotificationType,
  OfferExpirationNotification,
} from '@/lib/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeApplicationMetadata(metadata: unknown): ApplicationMetadata {
  if (!isRecord(metadata)) {
    return {};
  }

  const messages = Array.isArray(metadata.messages)
    ? metadata.messages.filter((message): message is ApplicationMetadataMessage => {
      if (!isRecord(message)) {
        return false;
      }

      return (
        typeof message.id === 'string' &&
        typeof message.actorRole === 'string' &&
        typeof message.message === 'string' &&
        typeof message.createdAt === 'string' &&
        (message.actorId === undefined || typeof message.actorId === 'string') &&
        (message.actorName === undefined || typeof message.actorName === 'string')
      );
    })
    : [];

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

  const offerExpirationNotifications = Array.isArray(metadata.offerExpirationNotifications)
    ? metadata.offerExpirationNotifications.filter((notification): notification is OfferExpirationNotification => {
      if (!isRecord(notification)) {
        return false;
      }

      return (
        (notification.daysRemaining === 1 || notification.daysRemaining === 3 || notification.daysRemaining === 7) &&
        typeof notification.offerExpiresAt === 'string' &&
        typeof notification.sentAt === 'string'
      );
    })
    : [];

  const timeline = Array.isArray(metadata.timeline)
    ? metadata.timeline.filter((entry): entry is ApplicationMetadataTimelineEntry => {
      if (!isRecord(entry)) {
        return false;
      }

      return (
        typeof entry.id === 'string' &&
        typeof entry.actorRole === 'string' &&
        typeof entry.createdAt === 'string' &&
        typeof entry.type === 'string' &&
        (entry.actorId === undefined || typeof entry.actorId === 'string') &&
        (entry.actorName === undefined || typeof entry.actorName === 'string') &&
        (entry.details === undefined || isRecord(entry.details))
      );
    })
    : [];

  return {
    ...(counterOffer ? { counterOffer } : {}),
    ...(messages.length > 0 ? { messages } : {}),
    ...(notifications.length > 0 ? { notifications } : {}),
    ...(offerExpirationNotifications.length > 0 ? { offerExpirationNotifications } : {}),
    ...(timeline.length > 0 ? { timeline } : {}),
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

export function appendApplicationMetadataMessage(
  metadata: ApplicationMetadata | undefined,
  message: Omit<ApplicationMetadataMessage, 'createdAt' | 'id'>
): ApplicationMetadata {
  const normalizedMetadata = normalizeApplicationMetadata(metadata);
  const messages = normalizedMetadata.messages ?? [];

  return {
    ...normalizedMetadata,
    messages: [
      ...messages,
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...message,
      },
    ],
  };
}

export function appendApplicationTimelineEntry(
  metadata: ApplicationMetadata | undefined,
  entry: Omit<ApplicationMetadataTimelineEntry, 'createdAt' | 'id'>
): ApplicationMetadata {
  const normalizedMetadata = normalizeApplicationMetadata(metadata);
  const timeline = normalizedMetadata.timeline ?? [];

  return {
    ...normalizedMetadata,
    timeline: [
      ...timeline,
      {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...entry,
      },
    ],
  };
}
