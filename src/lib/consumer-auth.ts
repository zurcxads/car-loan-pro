import type { User } from '@supabase/supabase-js';
import { dbGetApplicationByToken } from '@/lib/db';
import { useMockData as shouldUseMockData } from '@/lib/env';
import { MOCK_APPLICATIONS, type MockApplication } from '@/lib/mock-data';
import { serverLogger } from '@/lib/server-logger';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

export type ConsumerApplicationSummary = {
  borrowerEmail: string;
  borrowerFirstName: string;
  borrowerLastName: string;
  id: string;
  sessionToken: string | null;
  submittedAt: string;
};

type ApplicationRow = {
  borrower?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  id: string;
  session_token?: string | null;
  submitted_at?: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toSummaryFromMock(application: MockApplication): ConsumerApplicationSummary {
  const typedApplication = application as MockApplication & {
    sessionToken?: string;
  };

  return {
    borrowerEmail: application.borrower.email.toLowerCase(),
    borrowerFirstName: application.borrower.firstName,
    borrowerLastName: application.borrower.lastName,
    id: application.id,
    sessionToken: typedApplication.sessionToken ?? null,
    submittedAt: application.submittedAt,
  };
}

function toSummaryFromRow(row: ApplicationRow): ConsumerApplicationSummary | null {
  const borrowerEmail = row.borrower?.email?.toLowerCase();
  if (!borrowerEmail) {
    return null;
  }

  return {
    borrowerEmail,
    borrowerFirstName: row.borrower?.firstName ?? '',
    borrowerLastName: row.borrower?.lastName ?? '',
    id: row.id,
    sessionToken: row.session_token ?? null,
    submittedAt: row.submitted_at ?? new Date(0).toISOString(),
  };
}

function sortBySubmittedAtDesc(
  left: ConsumerApplicationSummary,
  right: ConsumerApplicationSummary
): number {
  return new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime();
}

export async function getLatestApplicationForEmail(
  email: string
): Promise<ConsumerApplicationSummary | null> {
  const normalizedEmail = normalizeEmail(email);

  if (shouldUseMockData()) {
    return (
      [...MOCK_APPLICATIONS]
        .filter((application) => application.borrower.email.toLowerCase() === normalizedEmail)
        .sort((left, right) => sortBySubmittedAtDesc(toSummaryFromMock(left), toSummaryFromMock(right)))
        .map(toSummaryFromMock)[0] ?? null
    );
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const supabase = getServiceClient();
  const queryColumns = 'id, borrower, submitted_at, session_token';

  const [{ data: borrowerMatches, error: borrowerError }, { data: emailMatches, error: emailError }] =
    await Promise.all([
      supabase
        .from('applications')
        .select(queryColumns)
        .eq('borrower->>email', normalizedEmail)
        .order('submitted_at', { ascending: false })
        .limit(5),
      supabase
        .from('applications')
        .select(queryColumns)
        .eq('email', normalizedEmail)
        .order('submitted_at', { ascending: false })
        .limit(5),
    ]);

  if (borrowerError) {
    serverLogger.error('Failed to query applications by borrower email', {
      email: normalizedEmail,
      error: borrowerError.message,
    });
  }

  if (emailError) {
    serverLogger.error('Failed to query applications by email column', {
      email: normalizedEmail,
      error: emailError.message,
    });
  }

  const deduped = new Map<string, ConsumerApplicationSummary>();

  for (const row of (borrowerMatches ?? []) as ApplicationRow[]) {
    const summary = toSummaryFromRow(row);
    if (summary) {
      deduped.set(summary.id, summary);
    }
  }

  for (const row of (emailMatches ?? []) as ApplicationRow[]) {
    const summary = toSummaryFromRow(row);
    if (summary) {
      deduped.set(summary.id, summary);
    }
  }

  return [...deduped.values()].sort(sortBySubmittedAtDesc)[0] ?? null;
}

export async function getConsumerApplicationFromSessionToken(
  sessionToken: string
): Promise<ConsumerApplicationSummary | null> {
  const application = await dbGetApplicationByToken(sessionToken);
  if (!application) {
    return null;
  }

  return toSummaryFromMock(application);
}

export async function findSupabaseUserByEmail(email: string): Promise<User | null> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const supabase = getServiceClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      serverLogger.error('Failed to list Supabase users', {
        email: normalizedEmail,
        error: error.message,
        page,
      });
      return null;
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) {
      return user;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

export function consumerPasswordIsSet(user: User | null): boolean {
  if (!user) {
    return false;
  }

  const metadata = user.user_metadata;
  return metadata?.consumer_password_set === true;
}
