import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';
import { dbGetOffer, dbUpdateOffer, dbUpdateApplication, dbGetOffers, dbGetApplication, dbCreateNotification } from '@/lib/db';
import { createApplicationEvent } from '@/lib/application-events';
import { sendEmail } from '@/lib/email-templates';

// POST /api/offers/[id]/select — consumer selects an offer
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  try {
    // Get the selected offer
    const offer = await dbGetOffer(id);
    if (!offer) {
      return apiError('Offer not found', 404);
    }

    // Get the application
    const application = await dbGetApplication(offer.applicationId);
    if (!application) {
      return apiError('Application not found', 404);
    }

    // Mark this offer as selected
    await dbUpdateOffer(id, { status: 'selected' });

    // Mark all other offers for this application as declined
    const allOffers = await dbGetOffers(offer.applicationId);
    const updatePromises = allOffers
      .filter(o => o.id !== id && o.status !== 'declined')
      .map(o => dbUpdateOffer(o.id, { status: 'declined' }));
    await Promise.all(updatePromises);

    // Update application status to pre_approved
    await dbUpdateApplication(offer.applicationId, {
      status: 'offers_available', // Keep as offers_available but consumer has selected one
    });

    // Create application event
    await createApplicationEvent(
      offer.applicationId,
      'offer_selected',
      `Selected offer from ${offer.lenderName}`,
      {
        offer_id: offer.id,
        lender_name: offer.lenderName,
        apr: offer.apr,
        approved_amount: offer.approvedAmount
      }
    );

    // Create notification
    await dbCreateNotification({
      userId: offer.applicationId,
      type: 'offer_selected',
      title: 'Offer Selected!',
      message: `You've selected the offer from ${offer.lenderName}. Your pre-approval letter is being prepared.`,
      read: false,
      data: { offer_id: offer.id, lender_name: offer.lenderName },
    });

    // Send offer selected email
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?token=${(application as unknown as { sessionToken?: string }).sessionToken}`;

    const offerSelectedEmailContent = {
      to: application.borrower.email,
      subject: `Congratulations! Pre-Approved by ${offer.lenderName}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Auto Loan Pro</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #2563eb; padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Auto Loan Pro</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #111827; margin-top: 0;">Congratulations, ${application.borrower.firstName}!</h2>
      <p style="color: #374151; line-height: 1.6;">
        You've been pre-approved by <strong>${offer.lenderName}</strong> for up to <strong>$${offer.approvedAmount.toLocaleString()}</strong> at <strong>${offer.apr}% APR</strong>.
      </p>
      <p style="color: #374151; line-height: 1.6;">
        Your pre-approval letter is ready to download from your dashboard. You can now shop with confidence at any participating dealer.
      </p>
      <p style="text-align: center;">
        <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 32px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 16px 0;">View Dashboard</a>
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        <strong>Next Steps:</strong> Upload any required documents to finalize your approval.
      </p>
    </div>
    <div style="padding: 24px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
      <p>Auto Loan Pro | autoloanpro.co</p>
      <p>Need help? Email support@autoloanpro.co</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    sendEmail(offerSelectedEmailContent).catch(err => {
      console.error('Failed to send offer selected email:', err);
    });

    // Generate approval token for the letter
    const approvalToken = crypto.randomUUID();

    // In production, store this token in a separate table or in the offer data
    // For now, we'll pass it back and use it as a query param

    return apiSuccess({
      message: 'Offer selected successfully',
      offer: { ...offer, status: 'selected' },
      approvalToken,
      applicationId: offer.applicationId,
    });
  } catch (error) {
    console.error('Error selecting offer:', error);
    return apiError('Failed to select offer', 500);
  }
}
