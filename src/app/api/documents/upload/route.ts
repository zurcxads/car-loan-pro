import { NextRequest, NextResponse } from 'next/server';
import {
  appendApplicationMetadataMessage,
  appendApplicationNotification,
  appendApplicationTimelineEntry,
  normalizeApplicationMetadata,
} from '@/lib/application-metadata';
import { createClient } from '@/lib/supabase/server';
import { createApplicationEvent } from '@/lib/application-events';
import { dbCreateNotification, dbGetApplication, dbUpdateApplication } from '@/lib/db';
import { requireAuth } from '@/lib/api-helpers';
import { serverLogger } from '@/lib/server-logger';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const DOCUMENT_TYPES = ['paystub', 'bank_statement', 'proof_of_residence', 'tax_return', 'drivers_license', 'proof_of_insurance', 'proof_of_income', 'proof_of_address', 'other'];

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = await createClient();
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;
    const userId = formData.get('userId') as string;
    const applicationId = formData.get('applicationId') as string | null;

    if (!file || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!DOCUMENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, JPG, or PNG' },
        { status: 400 }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const storagePath = `${userId}/${type}_${timestamp}.${fileExt}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      serverLogger.error('Storage upload error', { error: uploadError instanceof Error ? uploadError.message : String(uploadError) });
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Insert document record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        application_id: applicationId,
        type,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        status: 'uploaded',
      })
      .select()
      .single();

    if (dbError) {
      // Cleanup storage if DB insert fails
      await supabase.storage.from('documents').remove([storagePath]);
      serverLogger.error('Database insert error', { error: dbError instanceof Error ? dbError.message : String(dbError) });
      return NextResponse.json(
        { error: 'Failed to save document record' },
        { status: 500 }
      );
    }

    // Create application event if application ID is provided
    if (applicationId) {
      await createApplicationEvent(
        applicationId,
        'document_uploaded',
        `Document uploaded: ${type}`,
        { document_id: document.id, file_name: file.name }
      );

      // Create notification for the user
      await dbCreateNotification({
        userId: applicationId,
        type: 'document_requested',
        title: 'Document Uploaded',
        message: `Your ${type.replace(/_/g, ' ')} has been uploaded successfully and is being reviewed.`,
        read: false,
        data: { document_id: document.id, type },
      });

      const application = await dbGetApplication(applicationId);
      if (application) {
        const nextMetadata = appendApplicationTimelineEntry(
          appendApplicationNotification(
            appendApplicationMetadataMessage(normalizeApplicationMetadata(application.metadata), {
              actorRole: 'consumer',
              message: `Consumer uploaded ${file.name}`,
            }),
            {
              applicationId,
              message: `Consumer uploaded ${file.name}`,
              type: 'documents_uploaded',
            }
          ),
          {
            actorRole: 'consumer',
            details: { fileName: file.name, type },
            type: 'consumer_document_uploaded',
          }
        );

        const updatedApplication = await dbUpdateApplication(applicationId, {
          metadata: nextMetadata,
        });

        if (!updatedApplication) {
          serverLogger.warn('Failed to append lender-facing upload metadata', {
            applicationId,
            documentId: document.id,
            fileName: file.name,
          });
        }
      }
    }

    return NextResponse.json({ document });
  } catch (error) {
    serverLogger.error('Upload error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
