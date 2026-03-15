import { NextRequest } from 'next/server';
import { apiSuccess, apiError, parseBody, requireAuth } from '@/lib/api-helpers';
import { dbCreateOffer, dbUpdateApplication, dbGetApplication } from '@/lib/db';
import { serverLogger } from '@/lib/server-logger';
import { z } from 'zod';

const decisionSchema = z.object({
  applicationId: z.string(),
  decision: z.enum(['approve', 'counter', 'decline']),
  apr: z.number().optional(),
  termMonths: z.number().optional(),
  approvedAmount: z.number().optional(),
  monthlyPayment: z.number().optional(),
  conditions: z.array(z.string()).optional(),
  declineReason: z.string().optional(),
});

// POST /api/lenders/[lenderId]/decision — make a lending decision
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lenderId: string }> }
) {
  const { session, error: authError } = await requireAuth('lender');
  if (authError) return authError;

  const { lenderId } = await params;

  // AUTHORIZATION: Verify lender owns this resource
  if (lenderId !== session?.user.entityId) {
    return apiError('You can only make decisions for your own lender account', 403);
  }

  const { data, error } = await parseBody(req, decisionSchema);
  if (error) return error;
  if (!data) return apiError('Invalid data');

  try {
    const application = await dbGetApplication(data.applicationId);
    if (!application) {
      return apiError('Application not found', 404);
    }

    if (data.decision === 'approve' || data.decision === 'counter') {
      // Create an offer
      const offer = await dbCreateOffer({
        applicationId: data.applicationId,
        lenderId,
        lenderName: session?.user.name || 'Lender',
        apr: data.apr || 5.99,
        termMonths: data.termMonths || 60,
        monthlyPayment: data.monthlyPayment || 500,
        approvedAmount: data.approvedAmount || application.loanAmount,
        status: 'approved',
        conditions: data.conditions || [],
        decisionAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

      // Update application status
      await dbUpdateApplication(data.applicationId, {
        status: 'offers_available',
        offersReceived: application.offersReceived + 1,
      });

      return apiSuccess({ offer }, 201);
    } else {
      // Decline
      await dbUpdateApplication(data.applicationId, {
        status: 'pending_decision',
      });

      return apiSuccess({ message: 'Application declined' });
    }
  } catch (err) {
    serverLogger.error('Decision error', { error: err instanceof Error ? err.message : String(err) });
    return apiError('Failed to process decision', 500);
  }
}
