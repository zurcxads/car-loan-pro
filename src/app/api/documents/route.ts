import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api-helpers';
import { serverLogger } from '@/lib/server-logger';

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const applicationId = searchParams.get('applicationId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    const { data: documents, error } = await query;

    if (error) {
      serverLogger.error('Fetch documents error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents });
  } catch (error) {
    serverLogger.error('Documents API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { error: deleteAuthError } = await requireAuth();
  if (deleteAuthError) return deleteAuthError;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document to find storage path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.storage_path]);

    if (storageError) {
      serverLogger.error('Storage delete error', { error: storageError instanceof Error ? storageError.message : String(storageError) });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      serverLogger.error('Database delete error', { error: deleteError instanceof Error ? deleteError.message : String(deleteError) });
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    serverLogger.error('Delete error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
