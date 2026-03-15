import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/api-helpers';
import { dbGetApplicationByToken, dbGetOffer } from '@/lib/db';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import { serverLogger } from '@/lib/server-logger';
import { normalizeApplicationStatus } from '@/lib/application-status';

const ACTIVE_LOCKED_STATUSES = new Set(['offer_accepted', 'documents_requested', 'under_review']);

export async function GET(request: NextRequest) {
  const token = request.cookies.get(CONSUMER_SESSION_COOKIE)?.value;
  if (!token) {
    return apiError('Unauthorized', 401);
  }

  try {
    const application = await dbGetApplicationByToken(token);
    if (!application) {
      return apiError('Unauthorized', 401);
    }

    if (!application.lockedOfferId || !application.offerExpiresAt) {
      return apiSuccess({ hasActive: false });
    }

    const normalizedStatus = normalizeApplicationStatus(application.status);

    if (!ACTIVE_LOCKED_STATUSES.has(normalizedStatus)) {
      return apiSuccess({ hasActive: false });
    }

    const expiresAt = new Date(application.offerExpiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      return apiSuccess({ hasActive: false });
    }

    const offer = await dbGetOffer(application.lockedOfferId);
    if (!offer) {
      return apiSuccess({ hasActive: false });
    }

    return apiSuccess({
      hasActive: true,
      application: {
        id: application.id,
        status: normalizedStatus,
        offerExpiresAt: application.offerExpiresAt,
        lockedOffer: {
          id: offer.id,
          lenderName: offer.lenderName,
          apr: offer.apr,
          monthlyPayment: offer.monthlyPayment,
          termMonths: offer.termMonths,
        },
      },
    });
  } catch (routeError) {
    serverLogger.error('Active application route failed', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return apiError('Unable to load application', 500);
  }
}
