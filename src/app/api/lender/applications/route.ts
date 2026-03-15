import { apiSuccess, requireAuth } from '@/lib/api-helpers';
import { getLenderActiveApplications } from '@/lib/lender-applications';
import { serverLogger } from '@/lib/server-logger';

export async function GET() {
  const { session, error } = await requireAuth('lender');
  if (error) {
    return error;
  }

  const lenderId = session?.user.entityId;
  if (!lenderId) {
    return Response.json({ success: false, error: 'Lender account is missing an entity ID' }, { status: 403 });
  }

  try {
    const applications = await getLenderActiveApplications(lenderId);
    return apiSuccess({ applications });
  } catch (routeError) {
    serverLogger.error('Failed to load lender active applications', {
      error: routeError instanceof Error ? routeError.message : String(routeError),
      lenderId,
    });
    return Response.json({ success: false, error: 'Failed to load lender applications' }, { status: 500 });
  }
}
