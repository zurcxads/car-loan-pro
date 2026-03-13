import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export async function sendWebhook(
  url: string,
  secret: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; status: number; response: string }> {
  const payload: WebhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data,
  };

  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.text();

    return {
      success: response.ok,
      status: response.status,
      response: responseBody,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      response: error instanceof Error ? error.message : 'Request failed',
    };
  }
}
