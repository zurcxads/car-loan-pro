import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, getConsumerSessionToken } from '@/lib/api-helpers';
import {
  appendApplicationMetadataMessage,
  appendApplicationNotification,
  appendApplicationTimelineEntry,
  normalizeApplicationMetadata,
} from '@/lib/application-metadata';
import { dbGetApplicationByIdAndSessionToken, dbUpdateApplication } from '@/lib/db';
import { isSupabaseConfigured, getServiceClient } from '@/lib/supabase';
import { serverLogger } from '@/lib/server-logger';
import type { DocumentRequest } from '@/lib/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;

const uploadPayloadSchema = z.object({
  applicationId: z.string().min(1),
  requestId: z.string().min(1),
  fileName: z.string().min(1),
  fileType: z.enum(ALLOWED_TYPES),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE),
  fileDataBase64: z.string().min(1),
});

function normalizeDocumentRequests(documentRequests: DocumentRequest[] | undefined): DocumentRequest[] {
  return Array.isArray(documentRequests) ? documentRequests : [];
}

function isDocumentUploaded(request: DocumentRequest): boolean {
  return request.status === 'uploaded' || request.status === 'reviewed' || request.status === 'approved';
}

function areAllRequestedDocumentsUploaded(requests: DocumentRequest[]): boolean {
  return requests.length > 0 && requests.every(isDocumentUploaded);
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getFileExtension(fileName: string, fileType: string): string {
  const fromName = fileName.split('.').pop();
  if (fromName) {
    return fromName.toLowerCase();
  }

  switch (fileType) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      return 'bin';
  }
}

async function resolveOwnedApplication(request: NextRequest, applicationId: string) {
  const sessionToken = getConsumerSessionToken(request);
  if (!sessionToken) {
    return { application: null, error: apiError('Unauthorized', 401) };
  }

  const application = await dbGetApplicationByIdAndSessionToken(applicationId, sessionToken);
  if (!application) {
    return { application: null, error: apiError('Access denied', 403) };
  }

  return { application, error: null };
}

async function uploadToStorage(
  applicationId: string,
  requestId: string,
  fileName: string,
  fileType: string,
  fileBuffer: Buffer
): Promise<{ storagePath?: string; uploadPending: boolean; note?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      uploadPending: true,
      note: 'Supabase Storage is not configured. File metadata was saved, but bucket setup is still required for file uploads.',
    };
  }

  const storagePath = `applications/${applicationId}/requests/${requestId}/${Date.now()}-${sanitizeFileName(fileName)}`;

  try {
    const supabase = getServiceClient();
    const { error } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: fileType,
        upsert: false,
      });

    if (error) {
      serverLogger.warn('Document upload fallback activated', {
        applicationId,
        requestId,
        error: error.message,
      });

      return {
        uploadPending: true,
        note: 'File metadata was saved, but the Supabase Storage bucket is not ready. Configure the documents bucket to store uploaded files.',
      };
    }

    return { storagePath, uploadPending: false };
  } catch (error) {
    serverLogger.warn('Document upload fallback activated after storage exception', {
      applicationId,
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      uploadPending: true,
      note: 'File metadata was saved, but the upload could not be persisted to Supabase Storage.',
    };
  }
}

function updateDocumentRequest(
  requests: DocumentRequest[],
  requestId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  storagePath: string | undefined,
  uploadPending: boolean
): DocumentRequest[] | null {
  let found = false;
  const uploadedAt = new Date().toISOString();

  const nextRequests = requests.map((request) => {
    if (request.id !== requestId) {
      return request;
    }

    found = true;

    const updatedRequest: DocumentRequest = {
      ...request,
      status: 'uploaded',
      uploadedAt,
      document: {
        fileName,
        fileSize,
        mimeType: fileType,
        uploadedAt,
        storagePath,
        uploadPending,
      },
    };

    return updatedRequest;
  });

  return found ? nextRequests : null;
}

function buildMetadataForConsumerUpload(
  metadata: unknown,
  applicationId: string,
  fileName: string,
  allUploadedAfterUpdate: boolean
) {
  let nextMetadata = appendApplicationTimelineEntry(
    appendApplicationNotification(
      appendApplicationMetadataMessage(normalizeApplicationMetadata(metadata), {
        actorRole: 'consumer',
        message: `Consumer uploaded ${fileName}`,
      }),
      {
        applicationId,
        message: `Consumer uploaded ${fileName}`,
        type: 'documents_uploaded',
      }
    ),
    {
      actorRole: 'consumer',
      details: { fileName },
      type: 'consumer_document_uploaded',
    }
  );

  if (allUploadedAfterUpdate) {
    nextMetadata = appendApplicationNotification(nextMetadata, {
      type: 'documents_uploaded',
      applicationId,
      message: 'All requested documents have been uploaded',
    });
  }

  return nextMetadata;
}

export async function GET(request: NextRequest) {
  const applicationId = request.nextUrl.searchParams.get('applicationId');
  if (!applicationId) {
    return apiError('applicationId is required', 400);
  }

  try {
    const { application, error } = await resolveOwnedApplication(request, applicationId);
    if (error || !application) {
      return error;
    }

    return apiSuccess({
      documentRequests: normalizeDocumentRequests(application.documentRequests),
    });
  } catch (error) {
    serverLogger.error('Failed to fetch document requests', {
      applicationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError('Failed to fetch document requests', 500);
  }
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const applicationId = String(formData.get('applicationId') || '');
      const requestId = String(formData.get('requestId') || '');
      const file = formData.get('file');

      if (!applicationId || !requestId || !(file instanceof File)) {
        return apiError('applicationId, requestId, and file are required', 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return apiError('File size exceeds 10MB limit', 400);
      }

      if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
        return apiError('File type not allowed. Upload a PDF, JPG, or PNG file.', 400);
      }

      const { application, error } = await resolveOwnedApplication(request, applicationId);
      if (error || !application) {
        return error;
      }

      const requests = normalizeDocumentRequests(application.documentRequests);
      const allUploadedBeforeUpdate = areAllRequestedDocumentsUploaded(requests);
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const uploadResult = await uploadToStorage(applicationId, requestId, file.name, file.type, fileBuffer);
      const nextRequests = updateDocumentRequest(
        requests,
        requestId,
        file.name,
        file.type,
        file.size,
        uploadResult.storagePath,
        uploadResult.uploadPending
      );

      if (!nextRequests) {
        return apiError('Document request not found', 404);
      }

      const allUploadedAfterUpdate = areAllRequestedDocumentsUploaded(nextRequests);
      const nextMetadata = buildMetadataForConsumerUpload(
        application.metadata,
        applicationId,
        file.name,
        !allUploadedBeforeUpdate && allUploadedAfterUpdate
      );

      const updatedApplication = await dbUpdateApplication(applicationId, {
        documentRequests: nextRequests,
        status: application.status === 'documents_requested' && allUploadedAfterUpdate ? 'under_review' : application.status,
        metadata: nextMetadata,
      });

      if (!updatedApplication) {
        return apiError('Failed to save document upload', 500);
      }

      const updatedRequest = nextRequests.find((documentRequest) => documentRequest.id === requestId);
      return apiSuccess({
        documentRequest: updatedRequest,
        note: uploadResult.note,
      });
    }

    const payload = uploadPayloadSchema.safeParse(await request.json());
    if (!payload.success) {
      return apiError('Invalid upload payload', 400);
    }

    const { applicationId, requestId, fileName, fileType, fileSize, fileDataBase64 } = payload.data;
    const { application, error } = await resolveOwnedApplication(request, applicationId);
    if (error || !application) {
      return error;
    }

    const fileBuffer = Buffer.from(fileDataBase64, 'base64');
    if (fileBuffer.byteLength > MAX_FILE_SIZE) {
      return apiError('File size exceeds 10MB limit', 400);
    }

    const requests = normalizeDocumentRequests(application.documentRequests);
    const allUploadedBeforeUpdate = areAllRequestedDocumentsUploaded(requests);
    const uploadResult = await uploadToStorage(
      applicationId,
      requestId,
      `${sanitizeFileName(fileName.split('.').slice(0, -1).join('.') || fileName)}.${getFileExtension(fileName, fileType)}`,
      fileType,
      fileBuffer
    );
    const nextRequests = updateDocumentRequest(
      requests,
      requestId,
      fileName,
      fileType,
      fileSize,
      uploadResult.storagePath,
      uploadResult.uploadPending
    );

    if (!nextRequests) {
      return apiError('Document request not found', 404);
    }

    const allUploadedAfterUpdate = areAllRequestedDocumentsUploaded(nextRequests);
    const nextMetadata = buildMetadataForConsumerUpload(
      application.metadata,
      applicationId,
      fileName,
      !allUploadedBeforeUpdate && allUploadedAfterUpdate
    );

    const updatedApplication = await dbUpdateApplication(applicationId, {
      documentRequests: nextRequests,
      status: application.status === 'documents_requested' && allUploadedAfterUpdate ? 'under_review' : application.status,
      metadata: nextMetadata,
    });

    if (!updatedApplication) {
      return apiError('Failed to save document upload', 500);
    }

    const updatedRequest = nextRequests.find((documentRequest) => documentRequest.id === requestId);
    return apiSuccess({
      documentRequest: updatedRequest,
      note: uploadResult.note,
    });
  } catch (error) {
    serverLogger.error('Failed to upload requested document', {
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError('Failed to upload requested document', 500);
  }
}
