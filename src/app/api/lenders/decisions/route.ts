import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody } from '@/lib/api-helpers';
import { lenderDecisionSchema } from '@/lib/validations';
import { dbCreateOffer, dbUpdateApplication, dbGetApplication, dbCreateActivityEvent } from '@/lib/db';

// POST /api/lenders/decisions — lender submits decision on an application
export async function POST(req: NextRequest) {
  const { data, error } = await parseBody(req, lenderDecisionSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const app = await dbGetApplication(data.applicationId);
    if (!app) return apiError('Application not found', 404);

    if (data.decision === 'approve' || data.decision === 'counter') {
      // Create an offer
      const loanAmount = app.loanAmount;
      const apr = data.apr || 5.99;
      const termMonths = data.termMonths || 60;
      const monthlyRate = apr / 100 / 12;
      const payment = monthlyRate > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
        : loanAmount / termMonths;

      const offer = await dbCreateOffer({
        applicationId: data.applicationId,
        lenderName: 'Lender', // Would come from session in production
        apr,
        termMonths,
        monthlyPayment: Math.round(payment * 100) / 100,
        approvedAmount: data.approvedAmount || loanAmount,
        status: data.conditions?.length ? 'conditional' : 'approved',
        conditions: data.conditions || [],
        decisionAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Update application
      await dbUpdateApplication(data.applicationId, {
        status: 'offers_available',
        offersReceived: (app.offersReceived || 0) + 1,
      } as Record<string, unknown>);

      await dbCreateActivityEvent({
        type: 'offer',
        timestamp: new Date().toISOString(),
        description: `New offer for ${app.borrower.firstName} ${app.borrower.lastName} at ${apr}% APR`,
      });

      return apiSuccess(offer, 201);
    } else {
      // Decline
      await dbUpdateApplication(data.applicationId, {
        status: 'declined',
      } as Record<string, unknown>);

      await dbCreateActivityEvent({
        type: 'declined',
        timestamp: new Date().toISOString(),
        description: `${data.applicationId}: Declined - ${data.declineReason || 'Does not meet criteria'}`,
      });

      return apiSuccess({ applicationId: data.applicationId, decision: 'declined' });
    }
  } catch {
    return apiError('Failed to process decision', 500);
  }
}
