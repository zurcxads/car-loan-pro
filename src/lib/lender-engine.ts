// Lender Matching Engine
// Takes an application and matches it with eligible lenders, generates offers

import { dbGetLenders, dbCreateOffer, dbUpdateApplication, dbCreateNotification } from './db';
import { createApplicationEvent } from './application-events';
import type { MockApplication, MockLender } from './mock-data';
import { offersReadyEmail, sendEmail } from './email-templates';

interface MatchResult {
  matched: boolean;
  reason?: string;
}

export interface GeneratedOffer {
  lenderId: string;
  lenderName: string;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  approvedAmount: number;
  maxApprovedAmount?: number; // For no-vehicle pre-approvals
  status: 'approved' | 'conditional' | 'declined';
  conditions: string[];
}

/**
 * Main matching function: takes an application, finds matching lenders, generates offers
 */
export async function matchLendersAndGenerateOffers(application: MockApplication): Promise<GeneratedOffer[]> {
  const lenders = await dbGetLenders();
  const activeLenders = lenders.filter(l => l.isActive);

  const offers: GeneratedOffer[] = [];

  for (const lender of activeLenders) {
    const match = checkLenderEligibility(application, lender);

    if (match.matched) {
      const offer = generateOfferFromLender(application, lender);
      if (offer) {
        offers.push(offer);

        // Save offer to database
        await dbCreateOffer({
          applicationId: application.id,
          lenderId: lender.id,
          lenderName: lender.name,
          apr: offer.apr,
          termMonths: offer.termMonths,
          monthlyPayment: offer.monthlyPayment,
          approvedAmount: offer.approvedAmount,
          status: offer.status,
          conditions: offer.conditions,
          decisionAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });
      }
    }
  }

  // Update application with offer count
  await dbUpdateApplication(application.id, {
    lendersSubmitted: activeLenders.length,
    offersReceived: offers.length,
    status: offers.length > 0 ? 'offers_available' : 'declined',
  });

  // Create application event
  if (offers.length > 0) {
    await createApplicationEvent(
      application.id,
      'offer_received',
      `${offers.length} offer${offers.length > 1 ? 's' : ''} received from lenders`,
      { offer_count: offers.length }
    );

    // Create notification
    await dbCreateNotification({
      userId: application.id,
      type: 'offer_ready',
      title: 'Your Offers Are Ready!',
      message: `You have ${offers.length} pre-approval offer${offers.length > 1 ? 's' : ''} waiting for you.`,
      read: false,
      data: { offer_count: offers.length },
    });

    // Send email
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?token=${(application as unknown as { sessionToken?: string }).sessionToken}`;
    const emailData = offersReadyEmail(
      application.borrower.email,
      application.borrower.firstName,
      offers.length,
      dashboardUrl
    );
    sendEmail(emailData).catch(err => {
      console.error('Failed to send offers ready email:', err);
    });
  }

  return offers;
}

/**
 * Check if an application meets a lender's underwriting criteria
 */
function checkLenderEligibility(app: MockApplication, lender: MockLender): MatchResult {
  const ficoScore = app.credit.ficoScore || 0;

  // Check FICO score
  if (ficoScore > 0 && ficoScore < lender.minFico) {
    return { matched: false, reason: `FICO ${ficoScore} below min ${lender.minFico}` };
  }

  // Check DTI (always required)
  if (app.dtiPercent > lender.maxDti) {
    return { matched: false, reason: `DTI ${app.dtiPercent}% exceeds max ${lender.maxDti}%` };
  }

  // Check ITIN
  if (app.borrower.ssn === 'ITIN' && !lender.acceptsITIN) {
    return { matched: false, reason: 'Does not accept ITIN borrowers' };
  }

  // Check state
  if (!lender.statesActive.includes('All 50') && !lender.statesActive.includes(app.state)) {
    return { matched: false, reason: `Not active in ${app.state}` };
  }

  // If vehicle info provided, check vehicle-specific criteria
  if (app.hasVehicle && app.vehicle) {
    const vehicleAge = new Date().getFullYear() - (app.vehicle.year || 0);

    // Check LTV
    if (app.ltvPercent && app.ltvPercent > lender.maxLtv) {
      return { matched: false, reason: `LTV ${app.ltvPercent}% exceeds max ${lender.maxLtv}%` };
    }

    // Check PTI
    if (app.ptiPercent && app.ptiPercent > lender.maxPti) {
      return { matched: false, reason: `PTI ${app.ptiPercent}% exceeds max ${lender.maxPti}%` };
    }

    // Check loan amount
    if (app.loanAmount && (app.loanAmount < lender.minLoanAmount || app.loanAmount > lender.maxLoanAmount)) {
      return { matched: false, reason: `Loan amount ${app.loanAmount} outside range $${lender.minLoanAmount}-$${lender.maxLoanAmount}` };
    }

    // Check vehicle age
    if (vehicleAge > lender.maxVehicleAge) {
      return { matched: false, reason: `Vehicle age ${vehicleAge} years exceeds max ${lender.maxVehicleAge}` };
    }

    // Check mileage
    if (app.vehicle.mileage && app.vehicle.mileage > lender.maxMileage) {
      return { matched: false, reason: `Mileage ${app.vehicle.mileage} exceeds max ${lender.maxMileage}` };
    }

    // Check CPO acceptance
    if (app.vehicle.condition === 'certified_pre_owned' && !lender.acceptsCPO) {
      return { matched: false, reason: 'Does not accept CPO vehicles' };
    }

    // Check private party
    const isPrivateParty = !app.vehicle.dealerName || app.dealStructure.salePrice === app.vehicle.askingPrice;
    if (isPrivateParty && !lender.acceptsPrivateParty) {
      return { matched: false, reason: 'Does not accept private party sales' };
    }
  }

  return { matched: true };
}

/**
 * Generate an offer from a lender based on rate tiers
 */
function generateOfferFromLender(app: MockApplication, lender: MockLender): GeneratedOffer | null {
  const ficoScore = app.credit.ficoScore || 600; // Default to 600 for ITIN borrowers
  const rateTiers = lender.rateTiers || [];

  // Find matching rate tier
  const tier = rateTiers.find(t => ficoScore >= t.ficoMin && ficoScore <= t.ficoMax);

  if (!tier) {
    // No rate tier found, decline
    return null;
  }

  // Calculate APR within tier (use midpoint with some variance)
  const aprRange = tier.rateMax - tier.rateMin;
  const variance = (Math.random() - 0.5) * aprRange * 0.3; // +/- 15% of range
  const apr = Math.max(tier.rateMin, Math.min(tier.rateMax, tier.rateMin + aprRange / 2 + variance));

  const termMonths = app.dealStructure.requestedTerm;

  // NO VEHICLE INFO: Calculate max approved amount based on income and credit
  if (!app.hasVehicle || !app.vehicle) {
    const monthlyIncome = app.employment.grossMonthlyIncome;

    // Formula: max approved = min(lender.maxLoanAmount, monthlyIncome * 0.15 * requestedTerm)
    // Adjusted by credit tier
    const creditMultiplier = ficoScore >= 720 ? 1.0 : ficoScore >= 660 ? 0.9 : ficoScore >= 620 ? 0.75 : 0.6;
    const incomeBasedMax = Math.floor(monthlyIncome * 0.15 * termMonths * creditMultiplier);
    const maxApprovedAmount = Math.min(lender.maxLoanAmount, incomeBasedMax);

    // For no-vehicle, we show a range. Use 80% of max as the display amount
    const approvedAmount = Math.floor(maxApprovedAmount * 0.8);

    // Estimate monthly payment at approved amount
    const monthlyRate = apr / 100 / 12;
    const monthlyPayment = Math.round(
      (approvedAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );

    // Determine conditions
    const conditions: string[] = [];
    if (ficoScore < 650) {
      conditions.push('Proof of income required');
    }
    if (app.employment.monthsAtEmployer < 12) {
      conditions.push('2 recent paystubs');
    }
    if (lender.tier === 'subprime' && app.dtiPercent > 45) {
      conditions.push('Co-signer may improve terms');
    }
    conditions.push('Final approval subject to vehicle verification');

    return {
      lenderId: lender.id,
      lenderName: lender.name,
      apr: parseFloat(apr.toFixed(2)),
      termMonths,
      monthlyPayment,
      approvedAmount,
      maxApprovedAmount, // Show the ceiling
      status: 'conditional',
      conditions,
    };
  }

  // HAS VEHICLE INFO: Use existing vehicle-based logic
  let approvedAmount = app.loanAmount || 0;
  if (ficoScore < 620 || (app.ltvPercent && app.ltvPercent > 110)) {
    // Reduce approved amount for higher risk
    approvedAmount = Math.floor(approvedAmount * 0.95);
  }

  // Calculate monthly payment
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = Math.round(
    (approvedAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );

  // Determine conditions
  const conditions: string[] = [];
  if (ficoScore < 650) {
    conditions.push('Proof of income required');
  }
  if (app.ltvPercent && app.ltvPercent > 100) {
    conditions.push('Full coverage insurance required');
  }
  if (app.employment.monthsAtEmployer < 12) {
    conditions.push('2 recent paystubs');
  }
  if (lender.tier === 'subprime' && app.dtiPercent > 45) {
    conditions.push('Co-signer may improve terms');
  }

  // Determine status
  const status = conditions.length > 0 ? 'conditional' : 'approved';

  return {
    lenderId: lender.id,
    lenderName: lender.name,
    apr: parseFloat(apr.toFixed(2)),
    termMonths,
    monthlyPayment,
    approvedAmount,
    status,
    conditions,
  };
}

/**
 * Calculate total cost of loan
 */
export function calculateTotalCost(monthlyPayment: number, termMonths: number): number {
  return monthlyPayment * termMonths;
}

/**
 * Calculate total interest paid
 */
export function calculateTotalInterest(principal: number, monthlyPayment: number, termMonths: number): number {
  return (monthlyPayment * termMonths) - principal;
}
