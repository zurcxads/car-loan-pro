import { NextRequest, NextResponse } from 'next/server';
import { getTestApplicationData } from '@/lib/test-data';
import { CONSUMER_SESSION_COOKIE, getConsumerSessionCookieOptions } from '@/lib/consumer-session';
import { verifyDevAccessRequest } from '@/lib/dev-access';
import { generateCreditProfile } from '@/lib/credit-profile';
import { dbCreateApplication } from '@/lib/db';
import { matchLendersAndGenerateOffers } from '@/lib/lender-engine';
import type { MockApplication } from '@/lib/mock-data';
import { serverLogger } from '@/lib/server-logger';

export async function POST(req: NextRequest) {
  const devAccess = await verifyDevAccessRequest(req);
  if (!devAccess.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { withVehicle = false } = body;
    const testData = getTestApplicationData(withVehicle);
    const timestamp = Date.now();
    const credit = generateCreditProfile();
    const loanAmount = withVehicle && testData.vehicleInfo?.askingPrice
      ? testData.vehicleInfo.askingPrice - (testData.dealStructure.cashDownPayment || 0)
      : undefined;
    const dtiPercent = Math.round(
      (credit.totalMonthlyObligations / testData.employmentInfo.grossMonthlyIncome) * 100
    );

    const applicationInput: Partial<MockApplication> = {
      borrower: {
        address: testData.addressInfo.currentAddressLine1,
        city: testData.addressInfo.currentCity,
        dob: testData.personalInfo.dob,
        email: `dev-${timestamp}@test.com`,
        firstName: testData.personalInfo.firstName,
        lastName: testData.personalInfo.lastName,
        monthlyHousingPayment: testData.addressInfo.monthlyHousingPayment,
        monthsAtAddress: testData.addressInfo.monthsAtCurrentAddress,
        phone: testData.personalInfo.phone,
        residenceType: testData.addressInfo.residenceType,
        ssn: testData.personalInfo.ssn,
        state: testData.addressInfo.currentState,
        zip: testData.addressInfo.currentZip,
      },
      credit: {
        derogatoryMarks: credit.derogatoryMarks,
        ficoScore: credit.ficoScore,
        hasBankruptcy: credit.hasBankruptcy,
        hasRepo: credit.hasRepo,
        openAutoTradelines: credit.openAutoTradelines,
        scoreTier: credit.ficoScore >= 720 ? 'prime' : credit.ficoScore >= 660 ? 'near_prime' : 'subprime',
        totalMonthlyObligations: credit.totalMonthlyObligations,
      },
      dealStructure: {
        downPayment: testData.dealStructure.cashDownPayment,
        requestedTerm: testData.dealStructure.desiredTermMonths,
        salePrice: testData.vehicleInfo?.askingPrice,
        totalAmountFinanced: loanAmount,
        tradeInPayoff: testData.dealStructure.tradeInPayoffAmount || 0,
        tradeInValue: 0,
      },
      dtiPercent,
      employment: {
        employer: testData.employmentInfo.employerName || '',
        grossMonthlyIncome: testData.employmentInfo.grossMonthlyIncome,
        incomeType: testData.employmentInfo.incomeTypePrimary,
        monthsAtEmployer: testData.employmentInfo.monthsAtEmployer,
        status: testData.employmentInfo.employmentStatus,
        title: testData.employmentInfo.jobTitle || '',
      },
      flags: ['dev_test'],
      hasVehicle: withVehicle,
      lendersSubmitted: 0,
      loanAmount,
      offersReceived: 0,
      ptiPercent: loanAmount
        ? Math.round(
            ((loanAmount / testData.dealStructure.desiredTermMonths) /
              testData.employmentInfo.grossMonthlyIncome) *
              100
          )
        : undefined,
      state: testData.addressInfo.currentState,
      status: 'pending_decision',
      submittedAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
      vehicle: withVehicle && testData.vehicleInfo
        ? {
            askingPrice: testData.vehicleInfo.askingPrice || 0,
            bookValue: testData.vehicleInfo.askingPrice || 0,
            condition: testData.vehicleInfo.vehicleCondition || 'used',
            dealerName: testData.vehicleInfo.dealerName || 'Developer Test Dealer',
            make: testData.vehicleInfo.make || '',
            mileage: testData.vehicleInfo.mileage || 0,
            model: testData.vehicleInfo.model || '',
            trim: testData.vehicleInfo.trim || '',
            vin: testData.vehicleInfo.vin || '',
            year: testData.vehicleInfo.year || new Date().getFullYear(),
          }
        : undefined,
    };

    const application = await dbCreateApplication(applicationInput);
    if (!application) {
      return NextResponse.json({ error: 'Failed to create test application' }, { status: 500 });
    }

    await matchLendersAndGenerateOffers(application).catch((error: unknown) => {
      serverLogger.error('[DEV] Failed to generate offers for test application', {
        error: error instanceof Error ? error.message : String(error),
      });
    });

    const sessionToken = (application as MockApplication & { sessionToken?: string }).sessionToken;
    const response = NextResponse.json({
      success: true,
      data: {
        email: application.borrower.email,
        id: application.id,
        status: application.status,
        withVehicle,
      },
    });

    if (sessionToken) {
      response.cookies.set(CONSUMER_SESSION_COOKIE, sessionToken, getConsumerSessionCookieOptions());
    }

    return response;
  } catch (error) {
    serverLogger.error('[DEV] Error creating test application', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Failed to create test application' },
      { status: 500 }
    );
  }
}
