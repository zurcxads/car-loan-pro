import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { createApprovalLetterPDF } from '@/lib/pdf-template';
import { generateApprovalLetterData } from '@/lib/approval-letter';
import { dbGetApplicationByToken, dbGetOffersByApplication } from '@/lib/db';
import { getConsumerSessionToken } from '@/lib/api-helpers';
import { logServerError } from '@/lib/server-logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getConsumerSessionToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const application = await dbGetApplicationByToken(token);
    if (!application) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const offers = await dbGetOffersByApplication(application.id);
    const selectedOffer = offers.find((offer) => offer.status === 'selected');
    if (!selectedOffer) {
      return NextResponse.json({ error: 'Approval letter unavailable' }, { status: 404 });
    }

    const letterData = generateApprovalLetterData(selectedOffer, application);

    // Generate QR code
    const verifyUrl = `https://autoloanpro.co/verify/${letterData.approvalCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    });

    // Generate PDF
    const stream = await renderToStream(
      createApprovalLetterPDF(letterData, qrCodeDataUrl)
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AutoLoanPro-PreApproval-${letterData.approvalCode}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    logServerError(error, { route: '/api/approval-letter/pdf', action: 'GET' });
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
