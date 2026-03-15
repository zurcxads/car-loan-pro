import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiSuccess, parseBody } from '@/lib/api-helpers';
import { getOwnedApplicationForRequest } from '@/lib/application-ownership';
import { dbUpdateApplication } from '@/lib/db';
import { serverLogger } from '@/lib/server-logger';
import type { Message, MessageSenderRole } from '@/lib/types';

const createMessageSchema = z.object({
  applicationId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
});

function normalizeMessages(messages: Message[] | undefined): Message[] {
  return Array.isArray(messages)
    ? [...messages].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    : [];
}

function resolveSenderRole(role: string | undefined): MessageSenderRole {
  if (role === 'lender' || role === 'admin') {
    return role;
  }

  return 'consumer';
}

export async function GET(request: NextRequest) {
  const applicationId = request.nextUrl.searchParams.get('applicationId');
  if (!applicationId) {
    return apiError('applicationId is required', 400);
  }

  try {
    const { application, error } = await getOwnedApplicationForRequest(request, applicationId);
    if (error || !application) {
      return error ?? apiError('Application not found', 404);
    }

    return apiSuccess({
      messages: normalizeMessages(application.messages),
    });
  } catch (error) {
    serverLogger.error('Failed to fetch application messages', {
      applicationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError('Failed to fetch messages', 500);
  }
}

export async function POST(request: NextRequest) {
  const { data, error: parseError } = await parseBody(request, createMessageSchema);
  if (parseError || !data) {
    return parseError ?? apiError('Invalid request body', 400);
  }

  try {
    const { application, error, session } = await getOwnedApplicationForRequest(request, data.applicationId);
    if (error || !application) {
      return error ?? apiError('Application not found', 404);
    }

    const now = new Date().toISOString();
    const senderRole = resolveSenderRole(session?.user.role);
    const message: Message = {
      id: crypto.randomUUID(),
      applicationId: data.applicationId,
      senderId: session?.user.id ?? `consumer:${application.id}`,
      senderRole,
      content: data.content,
      createdAt: now,
    };

    const nextMessages = [...normalizeMessages(application.messages), message];
    const updatedApplication = await dbUpdateApplication(data.applicationId, {
      messages: nextMessages,
    });

    if (!updatedApplication) {
      return apiError('Failed to save message', 500);
    }

    return apiSuccess({ message }, 201);
  } catch (error) {
    serverLogger.error('Failed to create application message', {
      applicationId: data.applicationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError('Failed to send message', 500);
  }
}
