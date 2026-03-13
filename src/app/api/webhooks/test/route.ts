import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { webhookId } = body;

    if (!webhookId) {
      return NextResponse.json(
        { error: 'webhookId is required' },
        { status: 400 }
      );
    }

    // Get webhook configuration
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (webhookError || !webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      );
    }

    // Create test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook from Auto Loan Pro',
        webhookId: webhook.id,
      },
    };

    // Generate signature
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(JSON.stringify(testPayload))
      .digest('hex');

    // Send webhook
    let success = false;
    let responseStatus = 0;
    let responseBody = '';

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'webhook.test',
        },
        body: JSON.stringify(testPayload),
      });

      responseStatus = response.status;
      responseBody = await response.text();
      success = response.ok;
    } catch (error) {
      responseBody = error instanceof Error ? error.message : 'Request failed';
    }

    // Log delivery
    await supabase.from('webhook_deliveries').insert({
      webhook_id: webhookId,
      event_type: 'webhook.test',
      payload: testPayload,
      response_status: responseStatus,
      response_body: responseBody,
      success,
    });

    return NextResponse.json({
      success,
      status: responseStatus,
      response: responseBody,
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to send test webhook' },
      { status: 500 }
    );
  }
}
