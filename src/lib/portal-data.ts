import {
  getDealerById,
  getLenderById,
  MOCK_ADVERSE_ACTIONS,
  MOCK_APPLICATIONS,
  MOCK_DEALERS,
  MOCK_DEALS,
  MOCK_FCRA_LOG,
  MOCK_LENDERS,
  type MockDealer,
  type MockLender,
} from '@/lib/mock-data';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'sold' | 'lost';

export interface DealerDashboardBuyer {
  application: {
    id: string;
  };
}

export interface DealerDashboardDeal {
  amount?: number;
  status?: string;
}

export interface DealerDashboardData {
  buyers: DealerDashboardBuyer[];
  deals: DealerDashboardDeal[];
}

export interface DealerLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  approvalAmount: number;
  creditTier: string;
  vehicle?: string;
  status: LeadStatus;
  lastContact?: string;
  assignedTo?: string;
  notes?: string;
}

export interface DealerSettingsNotifications {
  smsAlerts: boolean;
  emailDigest: 'daily' | 'weekly' | 'off';
  smsPhone: string;
}

export interface DealerSettingsData {
  dealer: MockDealer;
  notifications: DealerSettingsNotifications;
}

export type DealerRecord = MockDealer;
export type LenderRecord = MockLender;

export type AdverseAction = (typeof MOCK_ADVERSE_ACTIONS)[number];
export type FcraLogEntry = (typeof MOCK_FCRA_LOG)[number];

export interface ComplianceData {
  adverseActions: AdverseAction[];
  fcraLog: FcraLogEntry[];
  ecoaSummary: {
    available: boolean;
    minimumMonthsRequired: number;
    manualFlagCount: number;
  };
}

export interface RevenueMonth {
  month: string;
  referral: number;
  subscriptions: number;
  total: number;
}

export interface RevenueBillingData {
  lenders: MockLender[];
  dealers: MockDealer[];
  monthlyRevenue: RevenueMonth[];
}

export const MOCK_REVENUE_MONTHS: RevenueMonth[] = [
  { month: 'Oct', referral: 12600, subscriptions: 2296, total: 14896 },
  { month: 'Nov', referral: 15300, subscriptions: 2296, total: 17596 },
  { month: 'Dec', referral: 11400, subscriptions: 2296, total: 13696 },
  { month: 'Jan', referral: 16500, subscriptions: 2296, total: 18796 },
  { month: 'Feb', referral: 18900, subscriptions: 2296, total: 21196 },
  { month: 'Mar', referral: 8400, subscriptions: 2296, total: 10696 },
];

export function getFallbackLenderRules(lenderId?: string | null): MockLender {
  if (lenderId) {
    return getLenderById(lenderId) ?? MOCK_LENDERS[0];
  }

  return MOCK_LENDERS[0];
}

export function getFallbackDealerDashboard(dealerId?: string | null): DealerDashboardData {
  const buyers = MOCK_APPLICATIONS
    .filter((app) => app.status === 'offers_available' || app.status === 'conditional')
    .map((application) => ({
      application: {
        id: application.id,
      },
    }));

  const deals = dealerId
    ? MOCK_DEALS.filter((deal) => deal.dealerId === dealerId)
    : MOCK_DEALS;

  return { buyers, deals };
}

export function getFallbackDealerLeads(): DealerLead[] {
  const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'sold', 'lost'];

  return MOCK_APPLICATIONS.slice(0, 12).map((app, index) => ({
    id: app.id,
    name: `${app.borrower.firstName} ${app.borrower.lastName}`,
    phone: app.borrower.phone || '(555) 123-4567',
    email: app.borrower.email,
    approvalAmount: app.loanAmount || 25000,
    creditTier: app.credit.scoreTier,
    vehicle: app.vehicle ? `${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model}` : undefined,
    status: leadStatuses[index % leadStatuses.length],
    lastContact: index % 3 === 0 ? '2 hours ago' : undefined,
    assignedTo: index % 2 === 0 ? 'You' : 'Sarah M.',
  }));
}

export function getFallbackDealerSettings(dealerId?: string | null): DealerSettingsData {
  const dealer = dealerId ? getDealerById(dealerId) ?? MOCK_DEALERS[0] : MOCK_DEALERS[0];

  return {
    dealer,
    notifications: {
      smsAlerts: true,
      emailDigest: 'daily',
      smsPhone: dealer.phone,
    },
  };
}

export function getFallbackComplianceData(): ComplianceData {
  return {
    adverseActions: MOCK_ADVERSE_ACTIONS,
    fcraLog: MOCK_FCRA_LOG,
    ecoaSummary: {
      available: false,
      minimumMonthsRequired: 12,
      manualFlagCount: 0,
    },
  };
}

export function getFallbackRevenueBillingData(): RevenueBillingData {
  return {
    lenders: MOCK_LENDERS,
    dealers: MOCK_DEALERS,
    monthlyRevenue: MOCK_REVENUE_MONTHS,
  };
}
