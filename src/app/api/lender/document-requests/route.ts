import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody, requireAuth } from '@/lib/api-helpers';
import { sendDocumentsRequestedEmail } from '@/lib/consumer-notifications';
import { dbUpdateApplication } from '@/lib/db';
import { getLenderActiveApplication } from '@/lib/lender-applications';
import { serverLogger } from '@/lib/server-logger';
import type { DocumentRequest } from '@/lib/types';

const documentRequestTypes = [
  'pay_stub',
  'drivers_license',
  'bank_statement',
  'proof_of_residence',
  'proof_of_insurance',
  'tax_return',
  'income_verification',
  'other',
] as const;

const createDocumentRequestsSchema = z.object({
  applicationId: z.string().min(1),
  docTypes: z.array(z.enum(documentRequestTypes)).min(1),
  deadline: z.string().datetime(),
  notes: z.string().trim().max(1000).optional(),
});

function normalizeDocumentRequests(documentRequests: DocumentRequest[] | undefined): DocumentRequest[] {
  return Array.isArray(documentRequests) ? documentRequests : [];
}

export async function POST(request: NextRequest) {
  const { session, error: authError } = await requireAuth('lender');
  if (authError) {
    return authError;
  }

  const { data, error } = await parseBody(request, createDocumentRequestsSchema);
  if (error || !data) {
    return error ?? apiError('Invalid request body', 400);
  }

  const lenderId = session?.user.entityId;
  if (!lenderId) {
    return apiError('Lender account is missing an entity ID', 403);
  }

  try {
    const ownedApplication = await getLenderActiveApplication(lenderId, data.applicationId);
    if (!ownedApplication) {
      return apiError('Application not found', 404);
    }

    const requestedAt = new Date().toISOString();
    const nextRequests = [
      ...normalizeDocumentRequests(ownedApplication.application.documentRequests),
      ...data.docTypes.map((documentType): DocumentRequest => ({
        id: crypto.randomUUID(),
        applicationId: data.applicationId,
        type: documentType,
        status: 'pending',
        requestedAt,
        deadline: data.deadline,
        notes: data.notes,
      })),
    ];

    const updatedApplication = await dbUpdateApplication(data.applicationId, {
      documentRequests: nextRequests,
      status: 'documents_requested',
    });

    if (!updatedApplication) {
      return apiError('Failed to create document requests', 500);
    }

    const emailResult = await sendDocumentsRequestedEmail(
      ownedApplication.application.borrower.email,
      data.docTypes,
      data.deadline,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
    );

    if (!emailResult.success) {
      serverLogger.error('Failed to send consumer documents requested email', {
        applicationId: data.applicationId,
        email: ownedApplication.application.borrower.email,
      });
    }

    return apiSuccess({
      documentRequests: nextRequests,
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
      },
    }, 201);
  } catch (routeError) {
    serverLogger.error('Failed to create lender document requests', {
      applicationId: data.applicationId,
      lenderId,
      error: routeError instanceof Error ? routeError.message : String(routeError),
    });
    return apiError('Failed to create document requests', 500);
  }
}
