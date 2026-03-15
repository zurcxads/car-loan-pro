import type { NextRequest } from 'next/server';
import { apiError, getConsumerSessionToken, getOptionalAuth } from '@/lib/api-helpers';
import { dbGetApplication, dbGetApplicationByIdAndEmail, dbGetApplicationByIdAndSessionToken } from '@/lib/db';
import type { MockApplication } from '@/lib/mock-data';

type OwnershipResult = {
  application: MockApplication | null;
  error: Response | null;
  session: Awaited<ReturnType<typeof getOptionalAuth>>['session'];
};

export async function getOwnedApplicationForRequest(
  request: NextRequest,
  applicationId: string
): Promise<OwnershipResult> {
  const auth = await getOptionalAuth();
  if (auth.error) {
    return { application: null, error: auth.error, session: auth.session };
  }

  const role = auth.session?.user.role;
  if (role === 'admin' || role === 'lender') {
    const application = await dbGetApplication(applicationId);
    if (!application) {
      return { application: null, error: apiError('Application not found', 404), session: auth.session };
    }

    return { application, error: null, session: auth.session };
  }

  if (role === 'consumer' && auth.session?.user.email) {
    const application = await dbGetApplicationByIdAndEmail(applicationId, auth.session.user.email);
    if (!application) {
      return { application: null, error: apiError('Access denied', 403), session: auth.session };
    }

    return { application, error: null, session: auth.session };
  }

  const sessionToken = getConsumerSessionToken(request);
  if (!sessionToken) {
    return { application: null, error: apiError('Access denied', 403), session: auth.session };
  }

  const application = await dbGetApplicationByIdAndSessionToken(applicationId, sessionToken);
  if (!application) {
    return { application: null, error: apiError('Access denied', 403), session: auth.session };
  }

  return { application, error: null, session: auth.session };
}
