import { NextRequest, NextResponse } from 'next/server';
import { dbGetApplications } from '@/lib/db';
import { verifyDevAccessRequest } from '@/lib/dev-access';
import { resetMockTestApplications } from '@/lib/mock-data';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const devAccess = await verifyDevAccessRequest(request);
  if (!devAccess.valid) {
    return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
  }

  try {
    const applications = await dbGetApplications();
    const testApplicationIds = applications
      .filter((application) => application.borrower.email.toLowerCase().includes('@test.com'))
      .map((application) => application.id);

    if (testApplicationIds.length === 0) {
      return NextResponse.json({ success: true, data: { deleted: 0 } });
    }

    if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getServiceClient();
      const { error: offerDeleteError } = await supabase
        .from('offers')
        .delete()
        .in('application_id', testApplicationIds);

      if (offerDeleteError) {
        throw offerDeleteError;
      }

      const { error: applicationDeleteError } = await supabase
        .from('applications')
        .delete()
        .in('id', testApplicationIds);

      if (applicationDeleteError) {
        throw applicationDeleteError;
      }
    } else {
      resetMockTestApplications();
    }

    return NextResponse.json({ success: true, data: { deleted: testApplicationIds.length } });
  } catch (error) {
    console.error('[DEV] Failed to reset test data:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset test data' }, { status: 500 });
  }
}
