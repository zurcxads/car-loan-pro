import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/documents/download?id=xxx — download a document
export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return new Response('Document ID required', { status: 400 });
    }

    const supabase = await createClient();

    // Get document record
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return new Response('Document not found', { status: 404 });
    }

    // Get signed URL from Supabase Storage
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, 60); // 60 seconds

    if (urlError || !signedUrlData) {
      console.error('Failed to generate signed URL:', urlError);
      return new Response('Failed to generate download link', { status: 500 });
    }

    // Redirect to signed URL
    return Response.redirect(signedUrlData.signedUrl);
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Download failed', { status: 500 });
  }
}
