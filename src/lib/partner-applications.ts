import type { User } from '@supabase/supabase-js';
import { useMockData as shouldUseMockData } from '@/lib/env';
import { findSupabaseUserByEmail } from '@/lib/consumer-auth';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { serverLogger } from '@/lib/server-logger';

export type PartnerApplicationType = 'lender' | 'dealer';
export type PartnerApplicationStatus = 'pending' | 'approved' | 'rejected';

export type PartnerApplicationListItem = {
  companyName: string;
  contactName: string;
  email: string;
  id: string;
  rawId: string;
  status: PartnerApplicationStatus;
  submittedAt: string;
  type: PartnerApplicationType;
};

export type PartnerApplicationField = {
  label: string;
  value: string;
};

export type PartnerApplicationSection = {
  fields: PartnerApplicationField[];
  title: string;
};

export type PartnerApplicationDetail = PartnerApplicationListItem & {
  phone: string;
  rawData: Record<string, unknown>;
  rejectionReason: string | null;
  reviewedAt: string | null;
  sections: PartnerApplicationSection[];
};

export type PartnerApplicationDecisionResult = {
  application: PartnerApplicationDetail;
  authUserId: string | null;
  entityId: string | null;
  temporaryPassword: string | null;
};

type DecisionInput = {
  rejectionReason?: string;
  status: PartnerApplicationStatus;
};

type PartnerApplicationRow = Record<string, unknown>;

type MockPartnerApplication = {
  row: PartnerApplicationRow;
  type: PartnerApplicationType;
};

const hasDatabaseAccess = () => isSupabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const canUseMockData = () => shouldUseMockData() || !hasDatabaseAccess();

const mockPartnerApplications: MockPartnerApplication[] = [
  {
    type: 'lender',
    row: {
      id: 'mock-lender-001',
      company_name: 'Summit Auto Finance',
      nmls_number: '1845221',
      primary_contact_name: 'Rachel Kim',
      email: 'partners@summitauto.example',
      phone: '(214) 555-0124',
      min_fico_score: '620',
      max_ltv: 125,
      rate_min: 5.99,
      rate_max: 18.49,
      states_served: 'TX, OK, LA, AR',
      min_loan_amount: 5000,
      max_loan_amount: 65000,
      max_term_months: 84,
      status: 'pending',
      submitted_at: '2026-03-12T16:42:00.000Z',
      rejection_reason: null,
      reviewed_at: null,
    },
  },
  {
    type: 'lender',
    row: {
      id: 'mock-lender-002',
      company_name: 'BlueRiver Credit',
      nmls_number: '990014',
      primary_contact_name: 'Daniel Ross',
      email: 'daniel@blueriver.example',
      phone: '(312) 555-0172',
      min_fico_score: '660',
      max_ltv: 110,
      rate_min: 4.79,
      rate_max: 11.99,
      states_served: 'IL, IN, WI',
      min_loan_amount: 7500,
      max_loan_amount: 55000,
      max_term_months: 72,
      status: 'approved',
      submitted_at: '2026-03-08T11:10:00.000Z',
      rejection_reason: null,
      reviewed_at: '2026-03-09T09:00:00.000Z',
    },
  },
  {
    type: 'dealer',
    row: {
      id: 'mock-dealer-001',
      dealership_name: 'Metro Drive Group',
      dealer_license_number: 'DLR-883174',
      primary_contact_name: 'Angela Brooks',
      email: 'angela@metrodrive.example',
      phone: '(404) 555-0136',
      street: '200 Peachtree Center Ave',
      city: 'Atlanta',
      state: 'GA',
      zip: '30303',
      monthly_vehicle_sales_volume: '26-50',
      vehicle_types: ['New', 'Used'],
      status: 'pending',
      submitted_at: '2026-03-13T14:18:00.000Z',
      rejection_reason: null,
      reviewed_at: null,
    },
  },
  {
    type: 'dealer',
    row: {
      id: 'mock-dealer-002',
      dealership_name: 'Pacific Motors Outlet',
      dealer_license_number: 'DLR-121442',
      primary_contact_name: 'Marcus Ellis',
      email: 'marcus@pacificmotors.example',
      phone: '(602) 555-0150',
      street: '4810 W Camelback Rd',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85031',
      monthly_vehicle_sales_volume: '11-25',
      vehicle_types: ['Used', 'CPO'],
      status: 'rejected',
      submitted_at: '2026-03-07T08:30:00.000Z',
      rejection_reason: 'Incomplete licensing documentation.',
      reviewed_at: '2026-03-08T12:05:00.000Z',
    },
  },
];

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => String(item)).join(', ') : 'Not provided';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function encodedId(type: PartnerApplicationType, rawId: string): string {
  return `${type}_${rawId}`;
}

export function parsePartnerApplicationId(id: string): { rawId: string; type: PartnerApplicationType } | null {
  if (id.startsWith('lender_')) {
    return { type: 'lender', rawId: id.slice('lender_'.length) };
  }

  if (id.startsWith('dealer_')) {
    return { type: 'dealer', rawId: id.slice('dealer_'.length) };
  }

  return null;
}

function mapApplicationListItem(type: PartnerApplicationType, row: PartnerApplicationRow): PartnerApplicationListItem {
  const rawId = String(row.id ?? '');
  const companyName = type === 'lender'
    ? String(row.company_name ?? '')
    : String(row.dealership_name ?? '');

  return {
    companyName,
    contactName: String(row.primary_contact_name ?? ''),
    email: String(row.email ?? ''),
    id: encodedId(type, rawId),
    rawId,
    status: (String(row.status ?? 'pending') as PartnerApplicationStatus),
    submittedAt: String(row.submitted_at ?? new Date().toISOString()),
    type,
  };
}

function buildSections(type: PartnerApplicationType, row: PartnerApplicationRow): PartnerApplicationSection[] {
  if (type === 'lender') {
    return [
      {
        title: 'Company Details',
        fields: [
          { label: 'Company Name', value: formatValue(row.company_name) },
          { label: 'NMLS Number', value: formatValue(row.nmls_number) },
          { label: 'States Served', value: formatValue(row.states_served) },
        ],
      },
      {
        title: 'Primary Contact',
        fields: [
          { label: 'Contact Name', value: formatValue(row.primary_contact_name) },
          { label: 'Email', value: formatValue(row.email) },
          { label: 'Phone', value: formatValue(row.phone) },
        ],
      },
      {
        title: 'Lending Criteria',
        fields: [
          { label: 'Minimum FICO', value: formatValue(row.min_fico_score) },
          { label: 'Maximum LTV', value: formatValue(row.max_ltv) },
          { label: 'Rate Range', value: `${formatValue(row.rate_min)}% - ${formatValue(row.rate_max)}%` },
          { label: 'Loan Amount Range', value: `$${formatValue(row.min_loan_amount)} - $${formatValue(row.max_loan_amount)}` },
          { label: 'Maximum Term', value: `${formatValue(row.max_term_months)} months` },
        ],
      },
    ];
  }

  return [
    {
      title: 'Dealership Details',
      fields: [
        { label: 'Dealership Name', value: formatValue(row.dealership_name) },
        { label: 'Dealer License Number', value: formatValue(row.dealer_license_number) },
        { label: 'Vehicle Types', value: formatValue(row.vehicle_types) },
        { label: 'Monthly Sales Volume', value: formatValue(row.monthly_vehicle_sales_volume) },
      ],
    },
    {
      title: 'Primary Contact',
      fields: [
        { label: 'Contact Name', value: formatValue(row.primary_contact_name) },
        { label: 'Email', value: formatValue(row.email) },
        { label: 'Phone', value: formatValue(row.phone) },
      ],
    },
    {
      title: 'Location',
      fields: [
        { label: 'Street', value: formatValue(row.street) },
        { label: 'City', value: formatValue(row.city) },
        { label: 'State', value: formatValue(row.state) },
        { label: 'ZIP', value: formatValue(row.zip) },
      ],
    },
  ];
}

function mapApplicationDetail(type: PartnerApplicationType, row: PartnerApplicationRow): PartnerApplicationDetail {
  const listItem = mapApplicationListItem(type, row);

  return {
    ...listItem,
    phone: String(row.phone ?? ''),
    rawData: row,
    rejectionReason: row.rejection_reason ? String(row.rejection_reason) : null,
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
    sections: [
      ...buildSections(type, row),
      {
        title: 'Review',
        fields: [
          { label: 'Status', value: formatValue(row.status) },
          { label: 'Submitted', value: formatValue(row.submitted_at) },
          { label: 'Reviewed', value: formatValue(row.reviewed_at) },
          { label: 'Rejection Reason', value: formatValue(row.rejection_reason) },
        ],
      },
    ],
  };
}

async function listRowsForType(type: PartnerApplicationType): Promise<PartnerApplicationRow[]> {
  if (canUseMockData()) {
    return mockPartnerApplications
      .filter((application) => application.type === type)
      .map((application) => application.row);
  }

  const supabase = getServiceClient();
  const table = type === 'lender' ? 'lender_applications' : 'dealer_applications';
  const { data, error } = await supabase.from(table).select('*').order('submitted_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PartnerApplicationRow[];
}

async function getRowForApplication(type: PartnerApplicationType, rawId: string): Promise<PartnerApplicationRow | null> {
  if (canUseMockData()) {
    return mockPartnerApplications.find((application) => application.type === type && String(application.row.id) === rawId)?.row ?? null;
  }

  const supabase = getServiceClient();
  const table = type === 'lender' ? 'lender_applications' : 'dealer_applications';
  const { data, error } = await supabase.from(table).select('*').eq('id', rawId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as PartnerApplicationRow | null) ?? null;
}

async function updateApplicationRow(type: PartnerApplicationType, rawId: string, updates: Record<string, unknown>) {
  if (canUseMockData()) {
    const application = mockPartnerApplications.find((item) => item.type === type && String(item.row.id) === rawId);
    if (!application) {
      throw new Error('Application not found');
    }

    application.row = {
      ...application.row,
      ...updates,
    };
    return;
  }

  const supabase = getServiceClient();
  const table = type === 'lender' ? 'lender_applications' : 'dealer_applications';
  const attempts = [
    updates,
    {
      status: updates.status,
    },
  ];

  for (const attempt of attempts) {
    const { error } = await supabase.from(table).update(attempt).eq('id', rawId);
    if (!error) {
      return;
    }
  }

  throw new Error('Unable to update application status');
}

async function ensurePartnerAuthUser(params: {
  email: string;
  entityId: string;
  fullName: string;
  role: PartnerApplicationType;
}): Promise<{ temporaryPassword: string | null; user: User | null }> {
  if (canUseMockData()) {
    return {
      temporaryPassword: 'TempPass!2026',
      user: null,
    };
  }

  const supabase = getServiceClient();
  const existingUser = await findSupabaseUserByEmail(params.email);
  const userMetadata = {
    entity_id: params.entityId,
    full_name: params.fullName,
    portal_password_set: false,
    role: params.role,
  };

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      email: params.email,
      email_confirm: true,
      user_metadata: {
        ...existingUser.user_metadata,
        ...userMetadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      temporaryPassword: null,
      user: data.user,
    };
  }

  const temporaryPassword = `ALP!${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const { data, error } = await supabase.auth.admin.createUser({
    email: params.email,
    email_confirm: true,
    password: temporaryPassword,
    user_metadata: userMetadata,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    temporaryPassword,
    user: data.user,
  };
}

async function upsertApprovedPartner(type: PartnerApplicationType, detail: PartnerApplicationDetail): Promise<string> {
  if (canUseMockData()) {
    return type === 'lender' ? 'LND-MOCK-001' : 'DLR-MOCK-001';
  }

  const supabase = getServiceClient();

  if (type === 'lender') {
    const existing = await supabase.from('lenders').select('id').eq('name', detail.companyName).maybeSingle();
    if (existing.error) {
      throw new Error(existing.error.message);
    }

    if (existing.data?.id) {
      const { error } = await supabase
        .from('lenders')
        .update({
          is_active: true,
          integration_status: 'pending_setup',
          max_loan_amount: Number(detail.rawData.max_loan_amount ?? 0),
          max_ltv: Number(detail.rawData.max_ltv ?? 0),
          min_fico: Number(detail.rawData.min_fico_score ?? 0),
          min_loan_amount: Number(detail.rawData.min_loan_amount ?? 0),
          name: detail.companyName,
          rate_tiers: [{
            ficoMax: 850,
            ficoMin: Number(detail.rawData.min_fico_score ?? 0),
            rateMax: Number(detail.rawData.rate_max ?? 0),
            rateMin: Number(detail.rawData.rate_min ?? 0),
          }],
          states_active: String(detail.rawData.states_served ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        })
        .eq('id', existing.data.id);

      if (error) {
        throw new Error(error.message);
      }

      return String(existing.data.id);
    }

    const { data, error } = await supabase
      .from('lenders')
      .insert({
        avg_decision_time_minutes: 0,
        integration_status: 'pending_setup',
        is_active: true,
        max_dti: 50,
        max_ltv: Number(detail.rawData.max_ltv ?? 0),
        max_mileage: 150000,
        max_loan_amount: Number(detail.rawData.max_loan_amount ?? 0),
        max_pti: 20,
        max_vehicle_age: 12,
        min_fico: Number(detail.rawData.min_fico_score ?? 0),
        min_loan_amount: Number(detail.rawData.min_loan_amount ?? 0),
        name: detail.companyName,
        rate_tiers: [{
          ficoMax: 850,
          ficoMin: Number(detail.rawData.min_fico_score ?? 0),
          rateMax: Number(detail.rawData.rate_max ?? 0),
          rateMin: Number(detail.rawData.rate_min ?? 0),
        }],
        referral_fee: 0,
        states_active: String(detail.rawData.states_served ?? '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        tier: Number(detail.rawData.min_fico_score ?? 0) >= 660 ? 'prime' : 'near_prime',
      })
      .select('id')
      .single();

    if (error || !data?.id) {
      throw new Error(error?.message ?? 'Unable to create lender');
    }

    return String(data.id);
  }

  const existing = await supabase.from('dealers').select('id').eq('name', detail.companyName).maybeSingle();
  if (existing.error) {
    throw new Error(existing.error.message);
  }

  const dealerPayload = {
    address: String(detail.rawData.street ?? ''),
    billing_date: new Date().toISOString(),
    buyers_sent_mtd: 0,
    city: String(detail.rawData.city ?? ''),
    contact_email: detail.email,
    deals_funded_mtd: 0,
    franchise_brands: Array.isArray(detail.rawData.vehicle_types) ? detail.rawData.vehicle_types : [],
    joined_date: new Date().toISOString(),
    name: detail.companyName,
    phone: detail.phone,
    plan: 'trial',
    plan_price: 0,
    state: String(detail.rawData.state ?? ''),
    status: 'active',
    team_members: [{
      addedDate: new Date().toISOString(),
      email: detail.email,
      name: detail.contactName,
      role: 'Primary Contact',
      status: 'active',
    }],
    website: '',
    zip: String(detail.rawData.zip ?? ''),
  };

  if (existing.data?.id) {
    const { error } = await supabase.from('dealers').update(dealerPayload).eq('id', existing.data.id);
    if (error) {
      throw new Error(error.message);
    }

    return String(existing.data.id);
  }

  const { data, error } = await supabase.from('dealers').insert(dealerPayload).select('id').single();
  if (error || !data?.id) {
    throw new Error(error?.message ?? 'Unable to create dealer');
  }

  return String(data.id);
}

export async function listPartnerApplications(filters: {
  status?: PartnerApplicationStatus;
  type?: PartnerApplicationType;
} = {}): Promise<PartnerApplicationListItem[]> {
  const types: PartnerApplicationType[] = filters.type ? [filters.type] : ['lender', 'dealer'];
  const rowsByType = await Promise.all(types.map(async (type) => ({
    rows: await listRowsForType(type),
    type,
  })));

  return rowsByType
    .flatMap(({ rows, type }) => rows.map((row) => mapApplicationListItem(type, row)))
    .filter((application) => !filters.status || application.status === filters.status)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function getPartnerApplicationDetail(id: string): Promise<PartnerApplicationDetail | null> {
  const parsed = parsePartnerApplicationId(id);
  if (!parsed) {
    return null;
  }

  const row = await getRowForApplication(parsed.type, parsed.rawId);
  if (!row) {
    return null;
  }

  return mapApplicationDetail(parsed.type, row);
}

export async function decidePartnerApplication(
  id: string,
  input: DecisionInput,
): Promise<PartnerApplicationDecisionResult> {
  const detail = await getPartnerApplicationDetail(id);
  if (!detail) {
    throw new Error('Application not found');
  }

  if (input.status === 'rejected') {
    await updateApplicationRow(detail.type, detail.rawId, {
      rejection_reason: input.rejectionReason?.trim() || null,
      reviewed_at: new Date().toISOString(),
      status: 'rejected',
    });

    const updated = await getPartnerApplicationDetail(id);
    if (!updated) {
      throw new Error('Application not found');
    }

    return {
      application: updated,
      authUserId: null,
      entityId: null,
      temporaryPassword: null,
    };
  }

  const entityId = await upsertApprovedPartner(detail.type, detail);
  const authResult = await ensurePartnerAuthUser({
    email: detail.email,
    entityId,
    fullName: detail.contactName,
    role: detail.type,
  });

  await updateApplicationRow(detail.type, detail.rawId, {
    reviewed_at: new Date().toISOString(),
    status: 'approved',
  });

  const updated = await getPartnerApplicationDetail(id);
  if (!updated) {
    throw new Error('Application not found');
  }

  return {
    application: updated,
    authUserId: authResult.user?.id ?? null,
    entityId,
    temporaryPassword: authResult.temporaryPassword,
  };
}

export function logPartnerApplicationFailure(message: string, metadata?: Record<string, unknown>) {
  serverLogger.error(message, metadata);
}
