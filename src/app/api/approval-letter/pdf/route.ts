import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { createApprovalLetterPDF } from '@/lib/pdf-template';
import { ApprovalLetterData } from '@/lib/approval-letter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const isDev = searchParams.get('dev') === 'true';

    let letterData: ApprovalLetterData;

    if (isDev) {
      // Dev mode: generate mock data
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const approvalCode = 'ALP-DEMO-1234';
      letterData = {
        approvalCode,
        lenderName: 'Capital Auto Finance',
        approvedAmount: 42000,
        apr: 4.2,
        termMonths: 60,
        monthlyPayment: 779,
        expiresAt: expiryDate.toISOString(),
        borrowerName: 'Maria Rodriguez',
        applicationId: 'APP-DEMO-001',
        offerId: 'OFFER-DEMO-001',
        generatedAt: new Date().toISOString(),
        conditions: [
          'Proof of income required at closing',
          'Final approval subject to vehicle inspection and appraisal',
          'Down payment of at least 10% recommended for optimal terms'
        ],
      };
    } else {
      // TODO: In production, fetch real data from database using token
      // For now, return error if not in dev mode
      if (!token) {
        return NextResponse.json(
          { error: 'Token required' },
          { status: 400 }
        );
      }

      // Placeholder: In real implementation, fetch from DB
      return NextResponse.json(
        { error: 'Production mode not yet implemented. Use ?dev=true for testing.' },
        { status: 501 }
      );
    }

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
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
