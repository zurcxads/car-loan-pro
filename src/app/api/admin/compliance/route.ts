import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import { getFallbackComplianceData } from '@/lib/portal-data';

export async function GET() {
  const { error } = await requireAuth('admin');
  if (error) return error;

  try {
    return apiSuccess(getFallbackComplianceData());
  } catch {
    return apiError('Failed to fetch compliance data', 500);
  }
}
