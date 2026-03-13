import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import * as React from 'react';
import {
  ApplicationSubmittedTemplate,
  OffersReadyTemplate,
  OfferSelectedTemplate,
  DocumentRequestedTemplate,
} from '@/lib/email-templates';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, data } = body;

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    let subject = '';
    let template: React.ReactElement | null = null;

    switch (type) {
      case 'application_submitted':
        subject = 'Application Received - Auto Loan Pro';
        template = React.createElement(ApplicationSubmittedTemplate, {
          firstName: data.firstName,
          applicationId: data.applicationId,
        });
        break;

      case 'offers_ready':
        subject = `${data.offerCount} ${data.offerCount === 1 ? 'Offer' : 'Offers'} Ready - Auto Loan Pro`;
        template = React.createElement(OffersReadyTemplate, {
          firstName: data.firstName,
          offerCount: data.offerCount,
          dashboardUrl: data.dashboardUrl,
        });
        break;

      case 'offer_selected':
        subject = 'Offer Selected - Auto Loan Pro';
        template = React.createElement(OfferSelectedTemplate, {
          firstName: data.firstName,
          lenderName: data.lenderName,
          apr: data.apr,
          monthlyPayment: data.monthlyPayment,
        });
        break;

      case 'document_requested':
        subject = 'Document Required - Auto Loan Pro';
        template = React.createElement(DocumentRequestedTemplate, {
          firstName: data.firstName,
          documentType: data.documentType,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // If Resend is not configured, just log to console
    if (!resend) {
      console.log('📧 Email would be sent (Resend not configured):');
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Type: ${type}`);
      console.log(`  Data:`, data);
      return NextResponse.json({
        success: true,
        message: 'Email logged to console (Resend API key not configured)',
      });
    }

    // Send email via Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'Auto Loan Pro <notifications@autoloanpro.co>',
      to: [to],
      subject,
      react: template,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: emailData?.id,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
