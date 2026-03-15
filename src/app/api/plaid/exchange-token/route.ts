import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { dbGetApplication } from '@/lib/db';
import { apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { logServerError } from '@/lib/server-logger';
import { z } from 'zod';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const exchangeTokenSchema = z.object({
  public_token: z.string().min(1),
  applicationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { data, error } = await parseBody(request, exchangeTokenSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const application = await dbGetApplication(data.applicationId);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const userRole = session?.user.role;
    const userEmail = session?.user.email;
    const isElevatedUser = userRole === 'admin' || userRole === 'lender';

    if (!isElevatedUser && (!userEmail || application.borrower.email !== userEmail)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: data.public_token,
    });

    const accessToken = exchangeResponse.data.access_token;

    // Get identity data
    const identityResponse = await plaidClient.identityGet({
      access_token: accessToken,
    });

    // In production, you would make additional API calls to get actual credit data
    // For now, we'll return mock data based on the successful authentication
    
    // Generate mock FICO score (in production this would come from a credit bureau)
    const mockFicoScore = Math.floor(Math.random() * (850 - 580) + 580);

    return NextResponse.json({
      credit_score: mockFicoScore,
      accounts: identityResponse.data.accounts || [],
      inquiries: [],
      public_records: [],
      identity: identityResponse.data.accounts?.[0]?.owners?.[0] || null,
    });
  } catch (error: unknown) {
    logServerError(error, { route: '/api/plaid/exchange-token', action: 'POST', metadata: { applicationId: data.applicationId } });
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
