import { dbGetApplication, dbGetOfferByIdAndApplicationId, dbUpdateApplication, dbUpdateOffer } from '@/lib/db';

type ApplicationLike = {
  id: string;
  offerExpiresAt?: string | null;
  lockedOfferId?: string | null;
};

export function checkOfferExpiration(application: ApplicationLike): { expired: boolean; daysRemaining: number } {
  if (!application.offerExpiresAt) {
    return { expired: false, daysRemaining: 0 };
  }

  const expiresAt = new Date(application.offerExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return { expired: false, daysRemaining: 0 };
  }

  const diffMs = expiresAt.getTime() - Date.now();
  const expired = diffMs <= 0;
  const daysRemaining = expired ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return { expired, daysRemaining };
}

export async function expireOffer(applicationId: string) {
  const application = await dbGetApplication(applicationId);
  if (!application) {
    return null;
  }

  if (application.lockedOfferId) {
    const offer = await dbGetOfferByIdAndApplicationId(application.lockedOfferId, application.id);
    if (offer) {
      await dbUpdateOffer(offer.id, {
        status: 'expired',
        lockedAt: null,
      });
    }
  }

  return dbUpdateApplication(applicationId, {
    status: 'expired',
    lockedOfferId: null,
    offerLockedAt: null,
    offerExpiresAt: null,
  });
}
