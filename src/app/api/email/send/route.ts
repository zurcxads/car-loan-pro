import { NextRequest, NextResponse } from 'next/server';
import {
  applicationReceivedEmail,
  offersReadyEmail,
  magicLinkEmail,
  approvalLetterEmail,
  sendEmail,
} from '@/lib/email-templates';
import { requireAuth } from '@/lib/api-helpers';
import { serverLogger } from '@/lib/server-logger';

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  try {
    const body = await req.json();
    const { type, to, data } = body;

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    let emailData;

    switch (type) {
      case 'application_submitted':
      case 'application_received':
        emailData = applicationReceivedEmail(to, data.firstName, data.applicationId);
        break;

      case 'offers_ready':
        emailData = offersReadyEmail(to, data.firstName, data.offerCount, data.dashboardUrl || '#');
        break;

      case 'magic_link':
        emailData = magicLinkEmail(to, data.firstName, data.magicLinkUrl);
        break;

      case 'approval_letter':
      case 'offer_selected':
        emailData = approvalLetterEmail(to, data.firstName, data.lenderName, data.approvedAmount, data.apr, data.approvalCode);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    const result = await sendEmail(emailData);
    return NextResponse.json(result);
  } catch (error) {
    serverLogger.error('Email send error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
