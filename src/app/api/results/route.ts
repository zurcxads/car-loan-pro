import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';
import { dbGetApplicationByToken, dbGetOffersByApplication } from '@/lib/db';
import { CONSUMER_SESSION_COOKIE } from '@/lib/consumer-session';
import { serverLogger } from '@/lib/server-logger';

// GET /api/results — get anonymized offers for results page
export async function GET(req: NextRequest) {
  const token = req.cookies.get(CONSUMER_SESSION_COOKIE)?.value;

  if (!token) {
    return apiError('Token required', 401);
  }

  try {
    const application = await dbGetApplicationByToken(token);
    if (!application) {
      return apiError('Invalid or expired token', 401);
    }

    // Get all offers for this application
    const offers = await dbGetOffersByApplication(application.id);

    if (!offers || offers.length === 0) {
      return apiSuccess({
        application: {
          id: application.id,
          status: application.status,
          offersReceived: application.offersReceived || 0,
          hasVehicle: application.hasVehicle,
        },
        offers: [],
        suggestedDownPayment: 0,
      });
    }

    // Sort offers by APR (best first)
    const sortedOffers = offers.sort((a, b) => a.apr - b.apr);

    // Anonymize top 3 offers
    const anonymizedOffers = sortedOffers.slice(0, 3).map((offer, index) => ({
      id: offer.id,
      label: `Offer ${String.fromCharCode(65 + index)}`, // A, B, C
      lenderId: offer.lenderId || '', // Keep for backend reference
      apr: offer.apr,
      baseApr: offer.apr,
      monthlyPayment: offer.monthlyPayment,
      approvedAmount: offer.approvedAmount,
      maxApprovedAmount: offer.maxApprovedAmount,
      rateTiers: generateRateTiers(offer.apr), // Generate rate tiers for different terms
    }));

    // Calculate suggested down payment (10% of approved amount)
    const suggestedDownPayment = Math.round((anonymizedOffers[0]?.approvedAmount || 0) * 0.1);

    return apiSuccess({
      application: {
        id: application.id,
        status: application.status,
        offersReceived: application.offersReceived || offers.length,
        hasVehicle: application.hasVehicle,
      },
      offers: anonymizedOffers,
      suggestedDownPayment,
    });
  } catch (err) {
    serverLogger.error('Results fetch error', { error: err instanceof Error ? err.message : String(err) });
    return apiError('Failed to fetch results', 500);
  }
}

/**
 * Generate rate tiers for different loan terms
 * Shorter terms get lower rates, longer terms get higher rates
 */
function generateRateTiers(baseApr: number): Array<{ termMonths: number; rateMin: number; rateMax: number }> {
  const tiers = [];
  const terms = [24, 36, 48, 60, 72, 84];

  for (const term of terms) {
    let adjustment = 0;
    if (term === 24) adjustment = -0.5;
    else if (term === 36) adjustment = -0.25;
    else if (term === 48) adjustment = 0;
    else if (term === 60) adjustment = 0.25;
    else if (term === 72) adjustment = 0.5;
    else if (term === 84) adjustment = 0.75;

    const rateMin = Math.max(0.99, baseApr + adjustment - 0.25);
    const rateMax = baseApr + adjustment + 0.25;

    tiers.push({
      termMonths: term,
      rateMin: parseFloat(rateMin.toFixed(2)),
      rateMax: parseFloat(rateMax.toFixed(2)),
    });
  }

  return tiers;
}
