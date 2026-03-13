import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetApplications, dbGetLender } from '@/lib/db';

// GET /api/lenders/[lenderId]/applications — get applications that match lender criteria
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lenderId: string }> }
) {
  const { error } = await requireAuth('lender');
  if (error) return error;

  const { lenderId } = await params;

  try {
    const lender = await dbGetLender(lenderId);
    if (!lender) {
      return apiError('Lender not found', 404);
    }

    // Get all applications
    const allApplications = await dbGetApplications();

    // Filter applications that match this lender's criteria
    const matchedApplications = allApplications.filter(app => {
      const ficoScore = app.credit?.ficoScore || 0;
      const ltv = app.ltvPercent || 0;
      const dti = app.dtiPercent || 0;
      const pti = app.ptiPercent || 0;
      const loanAmount = app.loanAmount || 0;
      const vehicleAge = new Date().getFullYear() - app.vehicle.year;

      // Check if application meets lender's criteria
      return (
        ficoScore >= lender.minFico &&
        ltv <= lender.maxLtv &&
        dti <= lender.maxDti &&
        pti <= lender.maxPti &&
        loanAmount >= lender.minLoanAmount &&
        loanAmount <= lender.maxLoanAmount &&
        vehicleAge <= lender.maxVehicleAge &&
        app.vehicle.mileage <= lender.maxMileage &&
        (lender.statesActive.includes('All 50') || lender.statesActive.includes(app.state))
      );
    });

    return apiSuccess({ applications: matchedApplications, lender });
  } catch {
    return apiError('Failed to fetch applications', 500);
  }
}
