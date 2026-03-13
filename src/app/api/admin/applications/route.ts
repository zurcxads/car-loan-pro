import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetApplications } from '@/lib/db';

// GET /api/admin/applications — get all applications (admin only)
export async function GET(req: NextRequest) {
  const { error } = await requireAuth('admin');
  if (error) return error;

  try {
    const status = req.nextUrl.searchParams.get('status');
    const state = req.nextUrl.searchParams.get('state');
    const search = req.nextUrl.searchParams.get('search');

    let applications = await dbGetApplications();

    // Apply filters
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    if (state) {
      applications = applications.filter(app => app.state === state);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      applications = applications.filter(app =>
        app.id.toLowerCase().includes(searchLower) ||
        app.borrower.firstName.toLowerCase().includes(searchLower) ||
        app.borrower.lastName.toLowerCase().includes(searchLower) ||
        app.borrower.email.toLowerCase().includes(searchLower)
      );
    }

    return apiSuccess({ applications });
  } catch {
    return apiError('Failed to fetch applications', 500);
  }
}
