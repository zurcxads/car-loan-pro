import { MockOffer, MockApplication } from './mock-data';

export interface ApprovalLetterData {
  approvalCode: string;
  lenderName: string;
  approvedAmount: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  expiresAt: string;
  borrowerName: string;
  applicationId: string;
  offerId: string;
  generatedAt: string;
  conditions: string[];
}

export function generateApprovalLetterData(
  offer: MockOffer,
  application: MockApplication
): ApprovalLetterData {
  const approvalCode = `ALP-${offer.id}-${Date.now().toString(36).toUpperCase()}`;

  return {
    approvalCode,
    lenderName: offer.lenderName,
    approvedAmount: offer.approvedAmount,
    apr: offer.apr,
    termMonths: offer.termMonths,
    monthlyPayment: offer.monthlyPayment,
    expiresAt: offer.expiresAt,
    borrowerName: `${application.borrower.firstName} ${application.borrower.lastName}`,
    applicationId: application.id,
    offerId: offer.id,
    generatedAt: new Date().toISOString(),
    conditions: offer.conditions,
  };
}
