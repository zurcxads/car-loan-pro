import {
  consumerDocumentsRequestedEmail,
  consumerOfferApprovedEmail,
  consumerOfferDeclinedEmail,
  consumerOfferExpiringEmail,
  sendEmail,
} from '@/lib/email-templates';

export async function sendOfferExpiringEmail(
  email: string,
  name: string,
  lenderName: string,
  daysRemaining: number,
  dashboardUrl: string
) {
  return sendEmail(consumerOfferExpiringEmail(email, name, daysRemaining, lenderName, dashboardUrl));
}

export async function sendDocumentsRequestedEmail(
  email: string,
  docTypes: string[],
  deadline: string,
  dashboardUrl: string
) {
  return sendEmail(consumerDocumentsRequestedEmail(email, docTypes, deadline, dashboardUrl));
}

export async function sendOfferApprovedEmail(
  email: string,
  lenderName: string,
  dashboardUrl: string
) {
  return sendEmail(consumerOfferApprovedEmail(email, lenderName, dashboardUrl));
}

export async function sendOfferDeclinedEmail(
  email: string,
  dashboardUrl: string
) {
  return sendEmail(consumerOfferDeclinedEmail(email, dashboardUrl));
}
