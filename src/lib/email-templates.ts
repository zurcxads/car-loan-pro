/**
 * Email templates for Auto Loan Pro
 *
 * These will be sent via Resend once the API key is configured.
 * For now, they log to console in dev mode.
 */

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

const BRAND_COLOR = '#2563eb'; // blue-600
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://autoloanpro.co';

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auto Loan Pro</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: ${BRAND_COLOR}; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 32px 24px; }
    .button { display: inline-block; padding: 16px 32px; background: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; margin: 16px 0; }
    .footer { padding: 24px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Auto Loan Pro</h1>
    </div>
    ${content}
    <div class="footer">
      <p>Auto Loan Pro | autoloanpro.co</p>
      <p>Need help? Email support@autoloanpro.co</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function applicationReceivedEmail(
  email: string,
  firstName: string,
  applicationId: string
): EmailData {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Application Received</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        We've received your auto loan application and our lender network is reviewing it now.
        You'll receive an email when your offers are ready—usually within minutes.
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        <strong>Application ID:</strong> ${applicationId}
      </p>
    </div>
  `;

  return {
    to: email,
    subject: 'Your Auto Loan Application Has Been Received',
    html: emailWrapper(content),
  };
}

export function offersReadyEmail(
  email: string,
  firstName: string,
  offerCount: number,
  magicLink: string
): EmailData {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">🎉 Your Offers Are Ready!</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        Great news! You have <strong>${offerCount} pre-approval offer${offerCount > 1 ? 's' : ''}</strong>
        waiting for you from our network of lenders.
      </p>
      <p style="text-align: center;">
        <a href="${magicLink}" class="button">View My Offers</a>
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        This link expires in 24 hours. Click the button above to review your personalized offers.
      </p>
    </div>
  `;

  return {
    to: email,
    subject: `${offerCount} Auto Loan Offer${offerCount > 1 ? 's' : ''} Ready for You`,
    html: emailWrapper(content),
  };
}

export function magicLinkEmail(
  email: string,
  firstName: string,
  magicLink: string
): EmailData {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Access Your Dashboard</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        Click the button below to securely access your Auto Loan Pro dashboard.
        No password needed.
      </p>
      <p style="text-align: center;">
        <a href="${magicLink}" class="button">Access Dashboard</a>
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 16px; padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 6px;">
        <strong>Security Tip:</strong> Never share this link with anyone. Our team will never ask for it.
      </p>
    </div>
  `;

  return {
    to: email,
    subject: 'Your Auto Loan Pro Login Link',
    html: emailWrapper(content),
  };
}

export function approvalLetterEmail(
  email: string,
  firstName: string,
  lenderName: string,
  approvedAmount: number,
  apr: number,
  dashboardLink: string
): EmailData {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">✅ Pre-Approved!</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        Congratulations! You've been pre-approved by <strong>${lenderName}</strong>.
      </p>
      <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Approved Amount</p>
        <p style="margin: 0 0 16px 0; color: #1e3a8a; font-size: 32px; font-weight: 700;">$${approvedAmount.toLocaleString()}</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">at ${apr}% APR</p>
      </div>
      <p style="color: #374151; line-height: 1.6;">
        Your pre-approval letter is ready to download from your dashboard.
        Present it at any participating dealer to shop with confidence.
      </p>
      <p style="text-align: center;">
        <a href="${dashboardLink}" class="button">Download Approval Letter</a>
      </p>
    </div>
  `;

  return {
    to: email,
    subject: `Pre-Approved for $${approvedAmount.toLocaleString()} - ${lenderName}`,
    html: emailWrapper(content),
  };
}

export function documentRequestEmail(
  email: string,
  firstName: string,
  documentsNeeded: string[],
  dashboardLink: string
): EmailData {
  const docList = documentsNeeded.map(doc => `<li>${doc.replace(/_/g, ' ')}</li>`).join('');

  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Documents Requested</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        To finalize your pre-approval, we need the following documents:
      </p>
      <ul style="color: #374151; line-height: 1.8; padding-left: 24px;">
        ${docList}
      </ul>
      <p style="text-align: center;">
        <a href="${dashboardLink}" class="button">Upload Documents</a>
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        You can upload PDFs, JPGs, or PNGs up to 10MB each. All documents are encrypted and securely stored.
      </p>
    </div>
  `;

  return {
    to: email,
    subject: 'Documents Needed for Your Auto Loan Pre-Approval',
    html: emailWrapper(content),
  };
}

export function documentApprovedEmail(
  email: string,
  firstName: string,
  documentType: string,
  dashboardLink: string
): EmailData {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Document Approved</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        Great news! Your <strong>${documentType.replace(/_/g, ' ')}</strong> has been reviewed and approved.
      </p>
      <p style="color: #374151; line-height: 1.6;">
        We're one step closer to finalizing your pre-approval. Check your dashboard for the latest status.
      </p>
      <p style="text-align: center;">
        <a href="${dashboardLink}" class="button">View Status</a>
      </p>
    </div>
  `;

  return {
    to: email,
    subject: `Your ${documentType.replace(/_/g, ' ')} Has Been Approved`,
    html: emailWrapper(content),
  };
}

export function approvalCompleteEmail(
  email: string,
  firstName: string,
  lenderName: string,
  approvedAmount: number,
  apr: number,
  dashboardLink: string
): EmailData {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Final Approval Complete!</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        Congratulations! Your pre-approval with <strong>${lenderName}</strong> is now complete.
      </p>
      <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Final Approved Amount</p>
        <p style="margin: 0 0 16px 0; color: #1e3a8a; font-size: 32px; font-weight: 700;">$${approvedAmount.toLocaleString()}</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">at ${apr}% APR</p>
      </div>
      <p style="color: #374151; line-height: 1.6;">
        Your pre-approval letter is ready to download. Present it at any participating dealer to shop with confidence.
      </p>
      <p style="text-align: center;">
        <a href="${dashboardLink}" class="button">Download Approval Letter</a>
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        <strong>Next Steps:</strong> Take your approval letter to the dealer. They'll submit the final application to the lender with vehicle details.
      </p>
    </div>
  `;

  return {
    to: email,
    subject: 'Your Pre-Approval is Complete — Download Your Letter',
    html: emailWrapper(content),
  };
}

export function rateExpiringEmail(
  email: string,
  firstName: string,
  daysRemaining: number,
  dashboardLink: string
): EmailData {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">Your Pre-Approval Rate Expires Soon</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${firstName},</p>
      <p style="color: #374151; line-height: 1.6;">
        This is a friendly reminder that your pre-approval rate expires in <strong>${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</strong>.
      </p>
      <p style="color: #374151; line-height: 1.6;">
        If you haven't found a vehicle yet, you can reapply after expiration. Your rate may change based on current market conditions.
      </p>
      <p style="text-align: center;">
        <a href="${dashboardLink}" class="button">View Pre-Approval</a>
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        <strong>Tip:</strong> Lock in your rate by finding a vehicle before expiration. Dealers can help you complete the purchase quickly.
      </p>
    </div>
  `;

  return {
    to: email,
    subject: `Your Pre-Approval Rate Expires in ${daysRemaining} Day${daysRemaining !== 1 ? 's' : ''}`,
    html: emailWrapper(content),
  };
}

/**
 * Send email via Resend or log to console in dev mode
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
  // Check if Resend API key is configured
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Dev mode: just log the email
    console.log('\n📧 EMAIL (DEV MODE - NOT SENT)');
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('HTML:', emailData.html.substring(0, 200) + '...\n');
    return { success: true };
  }

  try {
    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Auto Loan Pro <noreply@autoloanpro.co>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error: 'Failed to send email' };
    }

    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: 'Internal error' };
  }
}
