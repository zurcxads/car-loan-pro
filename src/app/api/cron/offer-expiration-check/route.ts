import { dbGetApplications, dbGetOffer, dbUpdateApplication, getServiceClient } from '@/lib/db';
import { normalizeApplicationMetadata } from '@/lib/application-metadata';
import { sendOfferExpiringEmail } from '@/lib/consumer-notifications';
import { serverLogger } from '@/lib/server-logger';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { MockApplication } from '@/lib/mock-data';
import type { OfferExpirationNotification } from '@/lib/types';

const ROUTE_PATH = '/api/cron/offer-expiration-check';
const ACTIVE_STATUSES: MockApplication['status'][] = ['offer_accepted', 'documents_requested', 'under_review'];

type CronApplicationRecord = Pick<
  MockApplication,
  'borrower' | 'id' | 'lockedOfferId' | 'metadata' | 'offerExpiresAt' | 'status'
>;

function isReminderDay(daysRemaining: number): daysRemaining is OfferExpirationNotification['daysRemaining'] {
  return daysRemaining === 1 || daysRemaining === 3 || daysRemaining === 7;
}

function getDaysRemaining(offerExpiresAt: string): OfferExpirationNotification['daysRemaining'] | null {
  const expiresAt = new Date(offerExpiresAt);
  const millisecondsRemaining = expiresAt.getTime() - Date.now();

  if (Number.isNaN(expiresAt.getTime()) || millisecondsRemaining <= 0) {
    return null;
  }

  const daysRemaining = Math.ceil(millisecondsRemaining / (24 * 60 * 60 * 1000));
  return isReminderDay(daysRemaining) ? daysRemaining : null;
}

async function getCandidateApplications(): Promise<CronApplicationRecord[]> {
  const now = new Date();
  const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const applications = await dbGetApplications();

    return applications.filter((application): application is CronApplicationRecord => {
      if (!application.lockedOfferId || !application.offerExpiresAt) {
        return false;
      }

      if (!ACTIVE_STATUSES.includes(application.status)) {
        return false;
      }

      const expiresAt = new Date(application.offerExpiresAt);
      if (Number.isNaN(expiresAt.getTime())) {
        return false;
      }

      return expiresAt >= now && expiresAt <= maxDate;
    });
  }

  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from('applications')
    .select('id, borrower, locked_offer_id, metadata, offer_expires_at, status')
    .not('locked_offer_id', 'is', null)
    .gte('offer_expires_at', now.toISOString())
    .lte('offer_expires_at', maxDate.toISOString())
    .in('status', ACTIVE_STATUSES);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    borrower: row.borrower as MockApplication['borrower'],
    id: row.id as string,
    lockedOfferId: row.locked_offer_id as string,
    metadata: row.metadata as MockApplication['metadata'],
    offerExpiresAt: row.offer_expires_at as string,
    status: row.status as MockApplication['status'],
  }));
}

function hasSentReminder(
  notifications: OfferExpirationNotification[] | undefined,
  daysRemaining: OfferExpirationNotification['daysRemaining'],
  offerExpiresAt: string
): boolean {
  return notifications?.some((notification) =>
    notification.daysRemaining === daysRemaining
    && notification.offerExpiresAt === offerExpiresAt
  ) ?? false;
}

export async function GET() {
  try {
    const applications = await getCandidateApplications();
    let processed = 0;
    let sent = 0;
    let skipped = 0;

    for (const application of applications) {
      processed += 1;

      if (!application.lockedOfferId || !application.offerExpiresAt) {
        skipped += 1;
        continue;
      }

      const daysRemaining = getDaysRemaining(application.offerExpiresAt);
      if (!daysRemaining) {
        skipped += 1;
        continue;
      }

      const metadata = normalizeApplicationMetadata(application.metadata);
      if (hasSentReminder(metadata.offerExpirationNotifications, daysRemaining, application.offerExpiresAt)) {
        skipped += 1;
        continue;
      }

      const offer = await dbGetOffer(application.lockedOfferId);
      if (!offer) {
        serverLogger.warn('Offer expiration reminder skipped: locked offer missing', {
          applicationId: application.id,
          offerId: application.lockedOfferId,
          route: ROUTE_PATH,
        });
        skipped += 1;
        continue;
      }

      const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
      const emailResult = await sendOfferExpiringEmail(
        application.borrower.email,
        application.borrower.firstName,
        offer.lenderName,
        daysRemaining,
        dashboardUrl
      );

      if (!emailResult.success) {
        serverLogger.error('Failed to send offer expiration reminder email', {
          applicationId: application.id,
          daysRemaining,
          email: application.borrower.email,
          route: ROUTE_PATH,
        });
        skipped += 1;
        continue;
      }

      const updatedApplication = await dbUpdateApplication(application.id, {
        metadata: {
          ...metadata,
          offerExpirationNotifications: [
            ...(metadata.offerExpirationNotifications ?? []),
            {
              daysRemaining,
              offerExpiresAt: application.offerExpiresAt,
              sentAt: new Date().toISOString(),
            },
          ],
        },
      });

      if (!updatedApplication) {
        serverLogger.error('Failed to persist offer expiration reminder metadata', {
          applicationId: application.id,
          daysRemaining,
          route: ROUTE_PATH,
        });
        continue;
      }

      sent += 1;
    }

    serverLogger.info('Offer expiration reminder check completed', {
      processed,
      route: ROUTE_PATH,
      sent,
      skipped,
    });

    return Response.json({
      success: true,
      data: {
        processed,
        sent,
        skipped,
      },
    });
  } catch (error) {
    serverLogger.error('Offer expiration reminder check failed', {
      error: error instanceof Error ? error.message : String(error),
      route: ROUTE_PATH,
    });
    return Response.json({ success: false, error: 'Unable to run offer expiration check.' }, { status: 500 });
  }
}
