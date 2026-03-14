import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth('lender');
  if (authError) return authError;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const lenderId = searchParams.get('lenderId');

    if (!lenderId) {
      return NextResponse.json(
        { error: 'lenderId is required' },
        { status: 400 }
      );
    }

    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('lender_id', lenderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Webhooks fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch webhooks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Webhooks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error: postAuthError } = await requireAuth('lender');
  if (postAuthError) return postAuthError;

  try {
    const supabase = await createClient();
    const body = await req.json();
    const { lenderId, url, events } = body;

    if (!lenderId || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate secret for webhook signing
    const secret = crypto.randomBytes(32).toString('hex');

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        lender_id: lenderId,
        url,
        events,
        secret,
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Webhook create error:', error);
      return NextResponse.json(
        { error: 'Failed to create webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Webhook create error:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { error: putAuthError } = await requireAuth('lender');
  if (putAuthError) return putAuthError;

  try {
    const supabase = await createClient();
    const body = await req.json();
    const { id, url, events, active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (url !== undefined) updateData.url = url;
    if (events !== undefined) updateData.events = events;
    if (active !== undefined) updateData.active = active;

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Webhook update error:', error);
      return NextResponse.json(
        { error: 'Failed to update webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Webhook update error:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { error: deleteAuthError } = await requireAuth('lender');
  if (deleteAuthError) return deleteAuthError;

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Webhook ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Webhook delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete webhook' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
