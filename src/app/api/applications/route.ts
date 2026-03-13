import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { applicationSubmitSchema } from '@/lib/validations';
import { dbGetApplications, dbCreateApplication } from '@/lib/db';
import { generateCreditProfile } from '@/lib/store';
import { matchLendersAndGenerateOffers } from '@/lib/lender-engine';
import type { MockApplication } from '@/lib/mock-data';

// GET /api/applications — list all applications
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status');
    let apps = await dbGetApplications();
    if (status) {
      apps = apps.filter(a => a.status === status);
    }
    return apiSuccess(apps);
  } catch {
    return apiError('Failed to fetch applications', 500);
  }
}

// POST /api/applications — submit new application
export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, applicationSubmitSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    // Generate credit profile
    const credit = generateCreditProfile();

    // Calculate loan metrics
    const loanAmount = data.vehicleInfo.askingPrice - data.dealStructure.cashDownPayment;
    const ltvPercent = Math.round((loanAmount / data.vehicleInfo.askingPrice) * 100);
    const dtiPercent = Math.round((credit.totalMonthlyObligations / data.employmentInfo.grossMonthlyIncome) * 100);
    const monthlyRate = 5 / 100 / 12; // estimate 5% APR
    const estPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, data.dealStructure.desiredTermMonths)) /
      (Math.pow(1 + monthlyRate, data.dealStructure.desiredTermMonths) - 1);
    const ptiPercent = Math.round((estPayment / data.employmentInfo.grossMonthlyIncome) * 100);

    const appData: Partial<MockApplication> = {
      borrower: {
        firstName: data.personalInfo.firstName,
        lastName: data.personalInfo.lastName,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        ssn: data.personalInfo.ssn.replace(/\d(?=\d{4})/g, '*').replace(/^(.{3})(.{2})/, '***-**'),
        dob: data.personalInfo.dob,
        address: data.addressInfo.currentAddressLine1,
        city: data.addressInfo.currentCity,
        state: data.addressInfo.currentState,
        zip: data.addressInfo.currentZip,
        residenceType: data.addressInfo.residenceType,
        monthlyHousingPayment: data.addressInfo.monthlyHousingPayment,
        monthsAtAddress: data.addressInfo.monthsAtCurrentAddress,
      },
      employment: {
        status: data.employmentInfo.employmentStatus,
        employer: data.employmentInfo.employerName || '',
        title: data.employmentInfo.jobTitle || '',
        monthsAtEmployer: data.employmentInfo.monthsAtEmployer,
        grossMonthlyIncome: data.employmentInfo.grossMonthlyIncome,
        incomeType: data.employmentInfo.incomeTypePrimary,
      },
      credit: {
        ficoScore: credit.ficoScore,
        scoreTier: credit.ficoScore >= 720 ? 'prime' : credit.ficoScore >= 660 ? 'near_prime' : 'subprime',
        totalMonthlyObligations: credit.totalMonthlyObligations,
        openAutoTradelines: credit.openAutoTradelines,
        derogatoryMarks: credit.derogatoryMarks,
        hasRepo: credit.hasRepo,
        hasBankruptcy: credit.hasBankruptcy,
      },
      vehicle: {
        year: data.vehicleInfo.year,
        make: data.vehicleInfo.make,
        model: data.vehicleInfo.model,
        trim: data.vehicleInfo.trim || '',
        vin: data.vehicleInfo.vin || '',
        mileage: data.vehicleInfo.mileage || 0,
        condition: data.vehicleInfo.vehicleCondition,
        bookValue: data.vehicleInfo.askingPrice,
        askingPrice: data.vehicleInfo.askingPrice,
        dealerName: data.vehicleInfo.dealerName || '',
      },
      dealStructure: {
        salePrice: data.vehicleInfo.askingPrice,
        downPayment: data.dealStructure.cashDownPayment,
        tradeInValue: 0,
        tradeInPayoff: data.dealStructure.tradeInPayoffAmount || 0,
        docFee: 499,
        taxAndFees: Math.round(data.vehicleInfo.askingPrice * 0.065),
        totalAmountFinanced: loanAmount,
        requestedTerm: data.dealStructure.desiredTermMonths,
      },
      loanAmount,
      ltvPercent,
      dtiPercent,
      ptiPercent,
      status: 'pending_decision',
      state: data.addressInfo.currentState,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lendersSubmitted: 0,
      offersReceived: 0,
      flags: [],
    };

    const app = await dbCreateApplication(appData);
    if (!app) return apiError('Failed to create application', 500);

    // Trigger lender matching engine in background
    // Don't await - let it run async so user doesn't wait
    matchLendersAndGenerateOffers(app).catch(err => {
      console.error('Lender matching failed:', err);
    });

    // Return app with session token for consumer dashboard access
    const sessionToken = (app as unknown as { sessionToken?: string }).sessionToken || crypto.randomUUID();

    return apiSuccess({
      id: app.id,
      sessionToken,
    }, 201);
  } catch (err) {
    console.error('Application creation error:', err);
    return apiError('Failed to create application', 500);
  }
}
