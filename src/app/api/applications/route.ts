import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { applicationSubmitSchema } from '@/lib/validations';
import { dbGetApplications, dbCreateApplication } from '@/lib/db';
import { generateCreditProfile } from '@/lib/store';
import { matchLendersAndGenerateOffers } from '@/lib/lender-engine';
import type { MockApplication } from '@/lib/mock-data';
import { createClient } from '@/lib/supabase/server';
import { applicationReceivedEmail, sendEmail } from '@/lib/email-templates';

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

    // Check if vehicle info was provided
    const hasVehicle = !!(data.vehicleInfo?.make && data.vehicleInfo?.askingPrice);

    // Calculate loan metrics
    let loanAmount: number | undefined;
    let ltvPercent: number | undefined;
    let ptiPercent: number | undefined;

    if (hasVehicle && data.vehicleInfo?.askingPrice) {
      const downPayment = data.dealStructure.cashDownPayment || 0;
      loanAmount = data.vehicleInfo.askingPrice - downPayment;
      ltvPercent = Math.round((loanAmount / data.vehicleInfo.askingPrice) * 100);

      const monthlyRate = 5 / 100 / 12; // estimate 5% APR
      const estPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, data.dealStructure.desiredTermMonths)) /
        (Math.pow(1 + monthlyRate, data.dealStructure.desiredTermMonths) - 1);
      ptiPercent = Math.round((estPayment / data.employmentInfo.grossMonthlyIncome) * 100);
    }

    const dtiPercent = Math.round((credit.totalMonthlyObligations / data.employmentInfo.grossMonthlyIncome) * 100);

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
      vehicle: hasVehicle && data.vehicleInfo ? {
        year: data.vehicleInfo.year || new Date().getFullYear(),
        make: data.vehicleInfo.make || '',
        model: data.vehicleInfo.model || '',
        trim: data.vehicleInfo.trim || '',
        vin: data.vehicleInfo.vin || '',
        mileage: data.vehicleInfo.mileage || 0,
        condition: data.vehicleInfo.vehicleCondition || 'used',
        bookValue: data.vehicleInfo.askingPrice || 0,
        askingPrice: data.vehicleInfo.askingPrice || 0,
        dealerName: data.vehicleInfo.dealerName || '',
      } : undefined,
      dealStructure: {
        salePrice: hasVehicle && data.vehicleInfo?.askingPrice ? data.vehicleInfo.askingPrice : undefined,
        downPayment: data.dealStructure.cashDownPayment || 0,
        tradeInValue: 0,
        tradeInPayoff: data.dealStructure.tradeInPayoffAmount || 0,
        docFee: hasVehicle ? 499 : undefined,
        taxAndFees: hasVehicle && data.vehicleInfo?.askingPrice ? Math.round(data.vehicleInfo.askingPrice * 0.065) : undefined,
        totalAmountFinanced: loanAmount,
        requestedTerm: data.dealStructure.desiredTermMonths,
      },
      loanAmount,
      ltvPercent,
      dtiPercent,
      ptiPercent,
      hasVehicle,
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

    // Silent account creation: create Supabase auth user with consumer's email
    const supabase = await createClient();
    let userId: string | null = null;

    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === data.personalInfo.email);

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user with auto-generated password they'll never use
        const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
          email: data.personalInfo.email,
          email_confirm: true,
          user_metadata: {
            role: 'consumer',
            full_name: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
            application_id: app.id,
          },
        });

        if (signUpError) {
          console.error('Failed to create Supabase user:', signUpError);
        } else if (newUser?.user) {
          userId = newUser.user.id;
        }
      }
    } catch (err) {
      console.error('Supabase user creation error:', err);
      // Continue anyway - user can still access via session token
    }

    // Generate session token for immediate access
    const sessionToken = crypto.randomUUID();

    // Store session token in application metadata (in real app, use a sessions table)
    // For now, we'll use the token as a query param and validate it on each request

    // Send application received email
    const emailData = applicationReceivedEmail(
      data.personalInfo.email,
      data.personalInfo.firstName,
      app.id
    );
    sendEmail(emailData).catch(err => {
      console.error('Failed to send application received email:', err);
    });

    // Trigger lender matching engine in background
    // Don't await - let it run async so user doesn't wait
    matchLendersAndGenerateOffers(app).catch(err => {
      console.error('Lender matching failed:', err);
    });

    return apiSuccess({
      id: app.id,
      sessionToken,
      userId,
    }, 201);
  } catch (err) {
    console.error('Application creation error:', err);
    return apiError('Failed to create application', 500);
  }
}
