import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers';
import { dbGetApplications } from '@/lib/db';
import { getFallbackDealerLeads, type DealerLead, type LeadStatus } from '@/lib/portal-data';
import { useMockData as shouldUseMockData } from '@/lib/env';

export async function GET() {
  const { error } = await requireAuth('dealer');
  if (error) return error;

  try {
    if (shouldUseMockData()) {
      return apiSuccess({ leads: getFallbackDealerLeads() });
    }

    const applications = await dbGetApplications();
    const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'sold', 'lost'];
    const leads: DealerLead[] = applications.slice(0, 12).map((application, index) => ({
      id: application.id,
      name: `${application.borrower.firstName} ${application.borrower.lastName}`,
      phone: application.borrower.phone || '(555) 123-4567',
      email: application.borrower.email,
      approvalAmount: application.loanAmount || 25000,
      creditTier: application.credit.scoreTier,
      vehicle: application.vehicle
        ? `${application.vehicle.year} ${application.vehicle.make} ${application.vehicle.model}`
        : undefined,
      status: leadStatuses[index % leadStatuses.length],
      lastContact: index % 3 === 0 ? '2 hours ago' : undefined,
      assignedTo: index % 2 === 0 ? 'You' : 'Sarah M.',
    }));

    return apiSuccess({ leads });
  } catch {
    return apiError('Failed to fetch dealer leads', 500);
  }
}
