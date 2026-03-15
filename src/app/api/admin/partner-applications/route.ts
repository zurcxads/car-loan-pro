import { NextRequest } from 'next/server';
import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import {
  listPartnerApplications,
  logPartnerApplicationFailure,
  type PartnerApplicationStatus,
  type PartnerApplicationType,
} from '@/lib/partner-applications';

function parseType(value: string | null): PartnerApplicationType | undefined {
  if (value === 'lender' || value === 'dealer') {
    return value;
  }

  return undefined;
}

function parseStatus(value: string | null): PartnerApplicationStatus | undefined {
  if (value === 'pending' || value === 'approved' || value === 'rejected') {
    return value;
  }

  return undefined;
}

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  try {
    const type = parseType(req.nextUrl.searchParams.get('type'));
    const status = parseStatus(req.nextUrl.searchParams.get('status'));
    const applications = await listPartnerApplications({ status, type });

    return apiSuccess({ applications });
  } catch (error) {
    logPartnerApplicationFailure('Failed to list partner applications', {
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError('Failed to fetch partner applications', 500);
  }
}
