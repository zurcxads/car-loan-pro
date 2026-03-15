import { dbGetApplication, dbGetApplications, dbGetOffer, dbGetOffers } from '@/lib/db';
import type { MockApplication, MockOffer } from '@/lib/mock-data';

export type LenderActiveApplication = {
  application: MockApplication;
  lockedOffer: MockOffer;
};

export async function getLenderActiveApplications(lenderId: string): Promise<LenderActiveApplication[]> {
  const [applications, offers] = await Promise.all([
    dbGetApplications(),
    dbGetOffers(),
  ]);

  const offersById = new Map<string, MockOffer>();
  for (const offer of offers) {
    offersById.set(offer.id, offer);
  }

  return applications
    .filter((application) => application.lockedOfferId)
    .map((application) => {
      const lockedOffer = application.lockedOfferId ? offersById.get(application.lockedOfferId) ?? null : null;
      return lockedOffer ? { application, lockedOffer } : null;
    })
    .filter((entry): entry is LenderActiveApplication => Boolean(entry && entry.lockedOffer.lenderId === lenderId))
    .sort((left, right) => {
      const leftDate = left.application.offerLockedAt ?? left.lockedOffer.lockedAt ?? left.application.updatedAt;
      const rightDate = right.application.offerLockedAt ?? right.lockedOffer.lockedAt ?? right.application.updatedAt;
      return rightDate.localeCompare(leftDate);
    });
}

export async function getLenderActiveApplication(
  lenderId: string,
  applicationId: string
): Promise<LenderActiveApplication | null> {
  const application = await dbGetApplication(applicationId);
  if (!application?.lockedOfferId) {
    return null;
  }

  const lockedOffer = await dbGetOffer(application.lockedOfferId);
  if (!lockedOffer || lockedOffer.lenderId !== lenderId) {
    return null;
  }

  return {
    application,
    lockedOffer,
  };
}
