import { NextResponse } from 'next/server';
import { dbCreateApplication } from '@/lib/db';

export async function GET() {
  try {
    // Replicate exact data shape from the apply form
    const appData = {
      borrower: {
        firstName: 'Debug', lastName: 'FormTest',
        email: 'debug@test.com', phone: '5551234567',
        ssn: '***-**-6789', dob: '1990-01-01',
        address: '123 Main', city: 'Austin', state: 'TX', zip: '78701',
        residenceType: 'rent', monthlyHousingPayment: 1500, monthsAtAddress: 24,
      },
      employment: {
        status: 'full_time', employer: 'Acme', title: 'QA',
        monthsAtEmployer: 36, grossMonthlyIncome: 7500, incomeType: 'employment',
      },
      credit: {
        ficoScore: 720, scoreTier: 'prime' as const,
        totalMonthlyObligations: 1200, openAutoTradelines: 0,
        derogatoryMarks: 0, hasRepo: false, hasBankruptcy: false,
      },
      dealStructure: {
        salePrice: undefined,
        downPayment: 0,
        tradeInValue: 0,
        tradeInPayoff: 0,
        docFee: undefined,
        taxAndFees: undefined,
        totalAmountFinanced: 25000,
        requestedTerm: 60,
      },
      loanAmount: 25000,
      ltvPercent: undefined,
      dtiPercent: 16,
      ptiPercent: undefined,
      hasVehicle: false,
      status: 'pending_decision' as const,
      state: 'TX',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lendersSubmitted: 0,
      offersReceived: 0,
      flags: [] as string[],
    };

    const app = await dbCreateApplication(appData);
    
    if (!app) {
      return NextResponse.json({ error: 'dbCreateApplication returned null — check server console for DB error' });
    }

    return NextResponse.json({ success: true, appId: app.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
