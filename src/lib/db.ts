// Database abstraction layer
// Falls back to mock data when Supabase is not configured

import { useMockData as shouldUseMockData } from './env';
import { decrypt, encrypt } from './encryption';
import { isSupabaseConfigured, getServiceClient } from './supabase';
import { serverLogger } from './server-logger';
import {
  MOCK_APPLICATIONS, MOCK_OFFERS, MOCK_LENDERS, MOCK_DEALERS,
  MOCK_DEALS, MOCK_ACTIVITY_EVENTS, MOCK_COMPLIANCE_ALERTS,
  type MockApplication, type MockOffer, type MockLender, type MockDealer,
  type MockDeal, type ActivityEvent, type ComplianceAlert,
} from './mock-data';

// All DB operations use service role client to bypass RLS
const db = () => getServiceClient();
const hasDatabaseAccess = () => isSupabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const canUseMockData = () => shouldUseMockData() || !hasDatabaseAccess();

// ---------- Applications ----------

export async function dbGetApplications(): Promise<MockApplication[]> {
  if (canUseMockData()) return MOCK_APPLICATIONS;
  if (!hasDatabaseAccess()) return [];
  const { data, error } = await db().from('applications').select('*').order('submitted_at', { ascending: false });
  if (error || !data) return canUseMockData() ? MOCK_APPLICATIONS : [];
  return data.map(mapDbToApp);
}

export async function dbGetApplication(id: string): Promise<MockApplication | null> {
  if (canUseMockData()) return MOCK_APPLICATIONS.find(a => a.id === id) || null;
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('applications').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbToApp(data);
}

export async function dbGetApplicationByIdAndSessionToken(id: string, sessionToken: string): Promise<MockApplication | null> {
  if (canUseMockData()) {
    return (
      MOCK_APPLICATIONS.find((application) => {
        const typedApplication = application as MockApplication & { sessionToken?: string };
        return typedApplication.id === id && typedApplication.sessionToken === sessionToken;
      }) || null
    );
  }

  if (!hasDatabaseAccess()) return null;

  const { data, error } = await db()
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('session_token', sessionToken)
    .single();

  if (error || !data) return null;
  return mapDbToApp(data);
}

export async function dbGetApplicationByIdAndEmail(id: string, email: string): Promise<MockApplication | null> {
  if (canUseMockData()) {
    return MOCK_APPLICATIONS.find((application) => application.id === id && application.borrower.email === email) || null;
  }

  if (!hasDatabaseAccess()) return null;

  const { data, error } = await db()
    .from('applications')
    .select('*')
    .eq('id', id)
    .eq('borrower->>email', email)
    .single();

  if (error || !data) return null;
  return mapDbToApp(data);
}

export async function dbCreateApplication(app: Partial<MockApplication>): Promise<MockApplication | null> {
  // Generate session token for consumer dashboard access
  const sessionToken = crypto.randomUUID();
  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  if (canUseMockData()) {
    const newApp = { 
      ...app, 
      id: `APP-${String(MOCK_APPLICATIONS.length + 1).padStart(3, '0')}`,
      sessionToken,
      sessionExpiresAt: sessionExpiresAt.toISOString(),
    } as MockApplication & { sessionToken: string; sessionExpiresAt: string };
    MOCK_APPLICATIONS.push(newApp as MockApplication);
    return newApp;
  }
  if (!hasDatabaseAccess()) return null;
  
  const appWithToken = {
    ...mapAppToDb(app),
    session_token: sessionToken,
    session_expires_at: sessionExpiresAt.toISOString(),
  };

  const insertVariants = [
    { label: 'primary', row: appWithToken },
    {
      label: 'legacy_has_vehicle',
      row: buildLegacyApplicationInsert(appWithToken),
    },
    {
      label: 'legacy_session_columns',
      row: stripSessionColumns(appWithToken),
    },
    {
      label: 'legacy_has_vehicle_and_session_columns',
      row: stripSessionColumns(buildLegacyApplicationInsert(appWithToken)),
    },
  ];

  for (const variant of insertVariants) {
    const { data, error } = await db().from('applications').insert(variant.row).select().single();
    if (!error && data) {
      return mapDbToApp({
        ...data,
        session_token: data.session_token ?? appWithToken.session_token,
        session_expires_at: data.session_expires_at ?? appWithToken.session_expires_at,
      });
    }

    serverLogger.error(`[db] Application insert failed (${variant.label})`, {
      error: JSON.stringify({ msg: error?.message, details: error?.details, hint: error?.hint, code: error?.code }),
    });
  }

  return null;
}

export async function dbUpdateApplication(id: string, updates: Partial<MockApplication>): Promise<MockApplication | null> {
  if (canUseMockData()) {
    const idx = MOCK_APPLICATIONS.findIndex(a => a.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_APPLICATIONS[idx], updates, { updatedAt: new Date().toISOString() });
    return MOCK_APPLICATIONS[idx];
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('applications').update(mapAppToDb(updates)).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToApp(data);
}

export async function dbGetApplicationByToken(token: string): Promise<MockApplication | null> {
  if (canUseMockData()) {
    return MOCK_APPLICATIONS.find(a => (a as unknown as { sessionToken?: string }).sessionToken === token) || null;
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error} = await db()
    .from('applications')
    .select('*')
    .eq('session_token', token)
    .single();
  if (error || !data) return null;

  // Check if token is expired
  const expiresAt = new Date(data.session_expires_at as string);
  if (expiresAt < new Date()) return null;

  return mapDbToApp(data);
}

// ---------- Offers ----------

export async function dbGetOffers(applicationId?: string): Promise<MockOffer[]> {
  if (canUseMockData()) {
    return applicationId ? MOCK_OFFERS.filter(o => o.applicationId === applicationId) : MOCK_OFFERS;
  }
  if (!hasDatabaseAccess()) return [];
  let query = db().from('offers').select('*');
  if (applicationId) query = query.eq('application_id', applicationId);
  const { data, error } = await query.order('apr', { ascending: true });
  if (error || !data) return canUseMockData() ? (applicationId ? MOCK_OFFERS.filter(o => o.applicationId === applicationId) : MOCK_OFFERS) : [];
  return data.map(mapDbToOffer);
}

export async function dbGetOffersByApplication(applicationId: string): Promise<MockOffer[]> {
  return dbGetOffers(applicationId);
}

export async function dbGetOffer(id: string): Promise<MockOffer | null> {
  if (canUseMockData()) return MOCK_OFFERS.find(o => o.id === id) || null;
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('offers').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbToOffer(data);
}

export async function dbGetOfferByIdAndApplicationId(id: string, applicationId: string): Promise<MockOffer | null> {
  if (canUseMockData()) {
    return MOCK_OFFERS.find((offer) => offer.id === id && offer.applicationId === applicationId) || null;
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db()
    .from('offers')
    .select('*')
    .eq('id', id)
    .eq('application_id', applicationId)
    .single();
  if (error || !data) return null;
  return mapDbToOffer(data);
}

export async function dbCreateOffer(offer: Partial<MockOffer>): Promise<MockOffer | null> {
  if (canUseMockData()) {
    const newOffer = { ...offer, id: `OFR-${String(MOCK_OFFERS.length + 1).padStart(3, '0')}` } as MockOffer;
    MOCK_OFFERS.push(newOffer);
    return newOffer;
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('offers').insert(mapOfferToDb(offer)).select().single();
  if (error || !data) return null;
  return mapDbToOffer(data);
}

export async function dbUpdateOffer(id: string, updates: Partial<MockOffer>): Promise<MockOffer | null> {
  if (canUseMockData()) {
    const idx = MOCK_OFFERS.findIndex(o => o.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_OFFERS[idx], updates);
    return MOCK_OFFERS[idx];
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('offers').update(mapOfferToDb(updates)).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToOffer(data);
}

// ---------- Lenders ----------

export async function dbGetLenders(): Promise<MockLender[]> {
  if (canUseMockData()) return MOCK_LENDERS;
  if (!hasDatabaseAccess()) return [];
  const { data, error } = await db().from('lenders').select('*');
  if (error || !data) return canUseMockData() ? MOCK_LENDERS : [];
  return data.map(mapDbToLender);
}

export async function dbGetLender(id: string): Promise<MockLender | null> {
  if (canUseMockData()) return MOCK_LENDERS.find(l => l.id === id) || null;
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('lenders').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbToLender(data);
}

export async function dbUpdateLender(id: string, updates: Partial<MockLender>): Promise<MockLender | null> {
  if (canUseMockData()) {
    const idx = MOCK_LENDERS.findIndex(l => l.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_LENDERS[idx], updates);
    return MOCK_LENDERS[idx];
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('lenders').update(mapLenderToDb(updates)).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToLender(data);
}

export async function dbCreateLender(lender: Partial<MockLender>): Promise<MockLender | null> {
  if (canUseMockData()) {
    const newLender = {
      id: `LND-${String(MOCK_LENDERS.length + 1).padStart(3, '0')}`,
      name: lender.name || 'New Lender',
      tier: lender.tier || 'prime',
      minFico: lender.minFico || 600,
      maxLtv: lender.maxLtv || 120,
      maxDti: lender.maxDti || 50,
      maxPti: lender.maxPti || 20,
      minLoanAmount: lender.minLoanAmount || 5000,
      maxLoanAmount: lender.maxLoanAmount || 50000,
      maxVehicleAge: lender.maxVehicleAge || 10,
      maxMileage: lender.maxMileage || 120000,
      acceptsCPO: lender.acceptsCPO ?? true,
      acceptsPrivateParty: lender.acceptsPrivateParty ?? false,
      acceptsITIN: lender.acceptsITIN ?? false,
      statesActive: lender.statesActive || ['All 50'],
      referralFee: lender.referralFee || 0,
      isActive: lender.isActive ?? false,
      integrationStatus: lender.integrationStatus || 'Pending',
      avgDecisionTimeMinutes: lender.avgDecisionTimeMinutes || 0,
      appsReceivedMTD: lender.appsReceivedMTD || 0,
      approvalRate: lender.approvalRate || 0,
      totalFundedVolume: lender.totalFundedVolume || 0,
      totalReferralFeesOwed: lender.totalReferralFeesOwed || 0,
      lastActivity: lender.lastActivity || new Date().toISOString(),
      rateTiers: lender.rateTiers || [],
    } satisfies MockLender;
    MOCK_LENDERS.push(newLender);
    return newLender;
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('lenders').insert(mapLenderToDb(lender)).select().single();
  if (error || !data) return null;
  return mapDbToLender(data);
}

// ---------- Dealers ----------

export async function dbGetDealers(): Promise<MockDealer[]> {
  if (canUseMockData()) return MOCK_DEALERS;
  if (!hasDatabaseAccess()) return [];
  const { data, error } = await db().from('dealers').select('*');
  if (error || !data) return canUseMockData() ? MOCK_DEALERS : [];
  return data.map(mapDbToDealer);
}

export async function dbGetDealer(id: string): Promise<MockDealer | null> {
  if (canUseMockData()) return MOCK_DEALERS.find(d => d.id === id) || null;
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('dealers').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbToDealer(data);
}

export async function dbUpdateDealer(id: string, updates: Partial<MockDealer>): Promise<MockDealer | null> {
  if (canUseMockData()) {
    const idx = MOCK_DEALERS.findIndex(d => d.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_DEALERS[idx], updates);
    return MOCK_DEALERS[idx];
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('dealers').update(mapDealerToDb(updates)).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToDealer(data);
}

export async function dbCreateDealer(dealer: Partial<MockDealer>): Promise<MockDealer | null> {
  if (canUseMockData()) {
    const newDealer = {
      id: `DLR-${String(MOCK_DEALERS.length + 1).padStart(3, '0')}`,
      name: dealer.name || 'New Dealer',
      city: dealer.city || '',
      state: dealer.state || '',
      address: dealer.address || '',
      zip: dealer.zip || '',
      phone: dealer.phone || '',
      website: dealer.website || '',
      contactEmail: dealer.contactEmail || '',
      franchiseBrands: dealer.franchiseBrands || [],
      buyersSentMTD: dealer.buyersSentMTD || 0,
      dealsFundedMTD: dealer.dealsFundedMTD || 0,
      plan: dealer.plan || 'trial',
      planPrice: dealer.planPrice || 0,
      billingDate: dealer.billingDate || new Date().toISOString(),
      status: dealer.status || 'pending',
      joinedDate: dealer.joinedDate || new Date().toISOString(),
      teamMembers: dealer.teamMembers || [],
    } satisfies MockDealer;
    MOCK_DEALERS.push(newDealer);
    return newDealer;
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('dealers').insert(mapDealerToDb(dealer)).select().single();
  if (error || !data) return null;
  return mapDbToDealer(data);
}

// ---------- Deals ----------

export async function dbGetDeals(dealerId?: string): Promise<MockDeal[]> {
  if (canUseMockData()) {
    return dealerId ? MOCK_DEALS.filter(d => d.dealerId === dealerId) : MOCK_DEALS;
  }
  if (!hasDatabaseAccess()) return [];
  let query = db().from('deals').select('*');
  if (dealerId) query = query.eq('dealer_id', dealerId);
  const { data, error } = await query;
  if (error || !data) return canUseMockData() ? (dealerId ? MOCK_DEALS.filter(d => d.dealerId === dealerId) : MOCK_DEALS) : [];
  return data.map(mapDbToDeal);
}

export async function dbCreateDeal(deal: Partial<MockDeal>): Promise<MockDeal | null> {
  if (canUseMockData()) {
    const newDeal = { ...deal, id: `DEAL-${String(MOCK_DEALS.length + 1).padStart(3, '0')}` } as MockDeal;
    MOCK_DEALS.push(newDeal);
    return newDeal;
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('deals').insert(mapDealToDb(deal)).select().single();
  if (error || !data) return null;
  return mapDbToDeal(data);
}

export async function dbUpdateDeal(id: string, updates: Partial<MockDeal>): Promise<MockDeal | null> {
  if (canUseMockData()) {
    const idx = MOCK_DEALS.findIndex(d => d.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_DEALS[idx], updates);
    return MOCK_DEALS[idx];
  }
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('deals').update(mapDealToDb(updates)).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToDeal(data);
}

export async function dbGetDeal(id: string): Promise<MockDeal | null> {
  if (canUseMockData()) return MOCK_DEALS.find((deal) => deal.id === id) || null;
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db().from('deals').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbToDeal(data);
}

// ---------- Activity Events ----------

export async function dbGetActivityEvents(): Promise<ActivityEvent[]> {
  if (canUseMockData()) return MOCK_ACTIVITY_EVENTS;
  if (!hasDatabaseAccess()) return [];
  const { data, error } = await db().from('activity_events').select('*').order('timestamp', { ascending: false });
  if (error || !data) return canUseMockData() ? MOCK_ACTIVITY_EVENTS : [];
  return data.map(mapDbToActivityEvent);
}

export async function dbCreateActivityEvent(event: Omit<ActivityEvent, 'id'>): Promise<void> {
  if (canUseMockData()) {
    MOCK_ACTIVITY_EVENTS.unshift({ ...event, id: `EVT-${String(MOCK_ACTIVITY_EVENTS.length + 1).padStart(3, '0')}` });
    return;
  }
  if (!hasDatabaseAccess()) return;
  await db().from('activity_events').insert({
    type: event.type,
    description: event.description,
    timestamp: event.timestamp,
  });
}

// ---------- Compliance ----------

export async function dbGetComplianceAlerts(): Promise<ComplianceAlert[]> {
  if (canUseMockData()) return MOCK_COMPLIANCE_ALERTS;
  if (!hasDatabaseAccess()) return [];
  const { data, error } = await db().from('compliance_alerts').select('*').order('timestamp', { ascending: false });
  if (error || !data) return canUseMockData() ? MOCK_COMPLIANCE_ALERTS : [];
  return data.map(mapDbToComplianceAlert);
}

// ---------- Stats ----------

export async function dbGetPlatformStats() {
  if (canUseMockData()) {
    const apps = MOCK_APPLICATIONS;
    const offers = MOCK_OFFERS;
    const deals = MOCK_DEALS;
    const lenders = MOCK_LENDERS;
    return {
      totalApplications: apps.length,
      pendingApplications: apps.filter(a => a.status === 'pending_decision').length,
      totalOffers: offers.length,
      totalLenders: lenders.length,
      activeLenders: lenders.filter(l => l.isActive).length,
      totalDealsFunded: deals.filter(d => d.status === 'funded').length,
      totalVolumeFunded: deals.filter(d => d.status === 'funded').reduce((s, d) => s + d.amount, 0),
      avgApprovalRate: Math.round(lenders.reduce((s, l) => s + l.approvalRate, 0) / lenders.length),
    };
  }
  if (!hasDatabaseAccess()) {
    return {
      totalApplications: 0,
      pendingApplications: 0,
      totalOffers: 0,
      totalLenders: 0,
      activeLenders: 0,
      totalDealsFunded: 0,
      totalVolumeFunded: 0,
      avgApprovalRate: 0,
    };
  }

  // Aggregate from Supabase
  const [appsRes, offersRes, lendersRes, dealsRes] = await Promise.all([
    db().from('applications').select('status'),
    db().from('offers').select('id'),
    db().from('lenders').select('is_active'),
    db().from('deals').select('status, amount'),
  ]);

  const apps = appsRes.data || [];
  const offers = offersRes.data || [];
  const lenders = lendersRes.data || [];
  const deals = dealsRes.data || [];

  return {
    totalApplications: apps.length,
    pendingApplications: apps.filter((a: Record<string, unknown>) => a.status === 'pending_decision').length,
    totalOffers: offers.length,
    totalLenders: lenders.length,
    activeLenders: lenders.filter((l: Record<string, unknown>) => l.is_active).length,
    totalDealsFunded: deals.filter((d: Record<string, unknown>) => d.status === 'funded').length,
    totalVolumeFunded: deals.filter((d: Record<string, unknown>) => d.status === 'funded').reduce((s: number, d: Record<string, unknown>) => s + Number(d.amount || 0), 0),
    avgApprovalRate: 0, // Not stored in production DB per-lender; would need separate tracking
  };
}

// ---------- Mapper helpers (Supabase snake_case <-> app camelCase) ----------

// --- Applications ---
function mapDbToApp(row: Record<string, unknown>): MockApplication {
  const borrower = deserializeBorrower(row.borrower);
  const app = {
    id: row.id as string,
    borrower,
    employment: row.employment as MockApplication['employment'],
    credit: row.credit as MockApplication['credit'],
    vehicle: row.vehicle as MockApplication['vehicle'],
    dealStructure: row.deal_structure as MockApplication['dealStructure'],
    loanAmount: row.loan_amount ? Number(row.loan_amount) : undefined,
    ltvPercent: row.ltv_percent ? Number(row.ltv_percent) : undefined,
    dtiPercent: Number(row.dti_percent || 0),
    ptiPercent: row.pti_percent ? Number(row.pti_percent) : undefined,
    hasVehicle: (row.has_vehicle as boolean) ?? false,
    status: row.status as MockApplication['status'],
    state: row.state as string,
    submittedAt: row.submitted_at as string,
    updatedAt: row.updated_at as string || new Date().toISOString(),
    lendersSubmitted: Number(row.lenders_submitted || 0),
    offersReceived: Number(row.offers_received || 0),
    flags: (row.flags as string[]) || [],
  };

  // Include session token if present (used for consumer dashboard access)
  if (row.session_token) {
    (app as unknown as { sessionToken: string }).sessionToken = row.session_token as string;
  }

  return app;
}

function mapAppToDb(app: Partial<MockApplication>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (app.id !== undefined) dbRow.id = app.id;
  if (app.borrower !== undefined) dbRow.borrower = serializeBorrower(app.borrower);
  if (app.employment !== undefined) dbRow.employment = app.employment;
  if (app.credit !== undefined) dbRow.credit = app.credit;
  if (app.vehicle !== undefined) dbRow.vehicle = app.vehicle;
  if (app.dealStructure !== undefined) dbRow.deal_structure = app.dealStructure;
  if (app.loanAmount !== undefined) dbRow.loan_amount = app.loanAmount;
  if (app.ltvPercent !== undefined) dbRow.ltv_percent = app.ltvPercent;
  if (app.dtiPercent !== undefined) dbRow.dti_percent = app.dtiPercent;
  if (app.ptiPercent !== undefined) dbRow.pti_percent = app.ptiPercent;
  if (app.hasVehicle !== undefined) dbRow.has_vehicle = app.hasVehicle;
  if (app.status !== undefined) dbRow.status = app.status;
  if (app.state !== undefined) dbRow.state = app.state;
  if (app.submittedAt !== undefined) dbRow.submitted_at = app.submittedAt;
  if (app.updatedAt !== undefined) dbRow.updated_at = app.updatedAt;
  if (app.lendersSubmitted !== undefined) dbRow.lenders_submitted = app.lendersSubmitted;
  if (app.offersReceived !== undefined) dbRow.offers_received = app.offersReceived;
  if (app.flags !== undefined) dbRow.flags = app.flags;
  return dbRow;
}

function serializeBorrower(
  borrower: MockApplication['borrower']
): MockApplication['borrower'] {
  const ssn = borrower.ssn
    ? encrypt(borrower.ssn, process.env.ENCRYPTION_KEY)
    : borrower.ssn;

  // Handles PII encryption at rest for borrower SSNs.
  return {
    ...borrower,
    ssn,
  };
}

function deserializeBorrower(
  borrower: unknown
): MockApplication['borrower'] {
  const parsedBorrower = (typeof borrower === 'object' && borrower !== null ? borrower : {}) as MockApplication['borrower'];

  if (!parsedBorrower.ssn) {
    return parsedBorrower;
  }

  return {
    ...parsedBorrower,
    ssn: decrypt(parsedBorrower.ssn, process.env.ENCRYPTION_KEY),
  };
}

function buildLegacyApplicationInsert(appRow: Record<string, unknown>): Record<string, unknown> {
  const legacyRow = { ...appRow };

  delete legacyRow.has_vehicle;

  if (legacyRow.vehicle === undefined) {
    legacyRow.vehicle = {};
  }

  if (legacyRow.loan_amount === undefined) {
    legacyRow.loan_amount = 0;
  }

  return legacyRow;
}

function stripSessionColumns(appRow: Record<string, unknown>): Record<string, unknown> {
  const legacyRow = { ...appRow };
  delete legacyRow.session_token;
  delete legacyRow.session_expires_at;
  return legacyRow;
}

// --- Offers ---
function mapDbToOffer(row: Record<string, unknown>): MockOffer {
  return {
    id: row.id as string,
    applicationId: row.application_id as string,
    lenderId: (row.lender_id as string) || '',
    lenderName: row.lender_name as string,
    apr: Number(row.apr || 0),
    termMonths: Number(row.term_months || 0),
    monthlyPayment: Number(row.monthly_payment || 0),
    approvedAmount: Number(row.approved_amount || 0),
    status: row.status as MockOffer['status'],
    conditions: (row.conditions as string[]) || [],
    decisionAt: row.decision_at as string,
    expiresAt: row.expires_at as string,
  };
}

function mapOfferToDb(offer: Partial<MockOffer>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (offer.id !== undefined) dbRow.id = offer.id;
  if (offer.applicationId !== undefined) dbRow.application_id = offer.applicationId;
  if (offer.lenderId !== undefined) dbRow.lender_id = offer.lenderId;
  if (offer.lenderName !== undefined) dbRow.lender_name = offer.lenderName;
  if (offer.apr !== undefined) dbRow.apr = offer.apr;
  if (offer.termMonths !== undefined) dbRow.term_months = offer.termMonths;
  if (offer.monthlyPayment !== undefined) dbRow.monthly_payment = offer.monthlyPayment;
  if (offer.approvedAmount !== undefined) dbRow.approved_amount = offer.approvedAmount;
  if (offer.status !== undefined) dbRow.status = offer.status;
  if (offer.conditions !== undefined) dbRow.conditions = offer.conditions;
  if (offer.decisionAt !== undefined) dbRow.decision_at = offer.decisionAt;
  if (offer.expiresAt !== undefined) dbRow.expires_at = offer.expiresAt;
  return dbRow;
}

// --- Lenders ---
function mapDbToLender(row: Record<string, unknown>): MockLender {
  return {
    id: row.id as string,
    name: row.name as string,
    tier: row.tier as MockLender['tier'],
    minFico: Number(row.min_fico || 0),
    maxLtv: Number(row.max_ltv || 0),
    maxDti: Number(row.max_dti || 0),
    maxPti: Number(row.max_pti || 0),
    minLoanAmount: Number(row.min_loan_amount || 0),
    maxLoanAmount: Number(row.max_loan_amount || 0),
    maxVehicleAge: Number(row.max_vehicle_age || 0),
    maxMileage: Number(row.max_mileage || 0),
    acceptsCPO: (row.accepts_cpo as boolean) ?? true,
    acceptsPrivateParty: (row.accepts_private_party as boolean) ?? false,
    acceptsITIN: (row.accepts_itin as boolean) ?? false,
    statesActive: (row.states_active as string[]) || ['All 50'],
    referralFee: Number(row.referral_fee || 0),
    isActive: (row.is_active as boolean) ?? true,
    integrationStatus: (row.integration_status as string) || 'API',
    avgDecisionTimeMinutes: Number(row.avg_decision_time_minutes || 0),
    // Fields not in DB — default to sensible values
    appsReceivedMTD: 0,
    approvalRate: 0,
    totalFundedVolume: 0,
    totalReferralFeesOwed: 0,
    lastActivity: new Date().toISOString(),
    rateTiers: (row.rate_tiers as MockLender['rateTiers']) || [],
  };
}

function mapLenderToDb(lender: Partial<MockLender>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (lender.id !== undefined) dbRow.id = lender.id;
  if (lender.name !== undefined) dbRow.name = lender.name;
  if (lender.tier !== undefined) dbRow.tier = lender.tier;
  if (lender.minFico !== undefined) dbRow.min_fico = lender.minFico;
  if (lender.maxLtv !== undefined) dbRow.max_ltv = lender.maxLtv;
  if (lender.maxDti !== undefined) dbRow.max_dti = lender.maxDti;
  if (lender.maxPti !== undefined) dbRow.max_pti = lender.maxPti;
  if (lender.minLoanAmount !== undefined) dbRow.min_loan_amount = lender.minLoanAmount;
  if (lender.maxLoanAmount !== undefined) dbRow.max_loan_amount = lender.maxLoanAmount;
  if (lender.maxVehicleAge !== undefined) dbRow.max_vehicle_age = lender.maxVehicleAge;
  if (lender.maxMileage !== undefined) dbRow.max_mileage = lender.maxMileage;
  if (lender.acceptsCPO !== undefined) dbRow.accepts_cpo = lender.acceptsCPO;
  if (lender.acceptsPrivateParty !== undefined) dbRow.accepts_private_party = lender.acceptsPrivateParty;
  if (lender.acceptsITIN !== undefined) dbRow.accepts_itin = lender.acceptsITIN;
  if (lender.statesActive !== undefined) dbRow.states_active = lender.statesActive;
  if (lender.referralFee !== undefined) dbRow.referral_fee = lender.referralFee;
  if (lender.isActive !== undefined) dbRow.is_active = lender.isActive;
  if (lender.integrationStatus !== undefined) dbRow.integration_status = lender.integrationStatus;
  if (lender.avgDecisionTimeMinutes !== undefined) dbRow.avg_decision_time_minutes = lender.avgDecisionTimeMinutes;
  if (lender.rateTiers !== undefined) dbRow.rate_tiers = lender.rateTiers;
  return dbRow;
}

// --- Dealers ---
function mapDbToDealer(row: Record<string, unknown>): MockDealer {
  return {
    id: row.id as string,
    name: row.name as string,
    city: row.city as string,
    state: row.state as string,
    address: row.address as string,
    zip: row.zip as string,
    phone: row.phone as string,
    website: (row.website as string) || '',
    contactEmail: (row.contact_email as string) || '',
    franchiseBrands: (row.franchise_brands as string[]) || [],
    buyersSentMTD: Number(row.buyers_sent_mtd || 0),
    dealsFundedMTD: Number(row.deals_funded_mtd || 0),
    plan: (row.plan as string) || 'Starter',
    planPrice: Number(row.plan_price || 299),
    billingDate: (row.billing_date as string) || '',
    status: (row.status as string) || 'active',
    joinedDate: (row.joined_date as string) || '',
    teamMembers: (row.team_members as MockDealer['teamMembers']) || [],
  };
}

function mapDealerToDb(dealer: Partial<MockDealer>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (dealer.id !== undefined) dbRow.id = dealer.id;
  if (dealer.name !== undefined) dbRow.name = dealer.name;
  if (dealer.city !== undefined) dbRow.city = dealer.city;
  if (dealer.state !== undefined) dbRow.state = dealer.state;
  if (dealer.address !== undefined) dbRow.address = dealer.address;
  if (dealer.zip !== undefined) dbRow.zip = dealer.zip;
  if (dealer.phone !== undefined) dbRow.phone = dealer.phone;
  if (dealer.website !== undefined) dbRow.website = dealer.website;
  if (dealer.contactEmail !== undefined) dbRow.contact_email = dealer.contactEmail;
  if (dealer.franchiseBrands !== undefined) dbRow.franchise_brands = dealer.franchiseBrands;
  if (dealer.buyersSentMTD !== undefined) dbRow.buyers_sent_mtd = dealer.buyersSentMTD;
  if (dealer.dealsFundedMTD !== undefined) dbRow.deals_funded_mtd = dealer.dealsFundedMTD;
  if (dealer.plan !== undefined) dbRow.plan = dealer.plan;
  if (dealer.planPrice !== undefined) dbRow.plan_price = dealer.planPrice;
  if (dealer.billingDate !== undefined) dbRow.billing_date = dealer.billingDate;
  if (dealer.status !== undefined) dbRow.status = dealer.status;
  if (dealer.joinedDate !== undefined) dbRow.joined_date = dealer.joinedDate;
  if (dealer.teamMembers !== undefined) dbRow.team_members = dealer.teamMembers;
  return dbRow;
}

// --- Deals ---
function mapDbToDeal(row: Record<string, unknown>): MockDeal {
  return {
    id: row.id as string,
    applicationId: row.application_id as string,
    dealerId: row.dealer_id as string,
    buyerFirstName: row.buyer_first_name as string,
    buyerLastInitial: row.buyer_last_initial as string,
    vehicle: row.vehicle as string,
    vin: row.vin as string,
    lenderName: row.lender_name as string,
    amount: Number(row.amount || 0),
    rate: Number(row.rate || 0),
    term: Number(row.term || 0),
    monthlyPayment: Number(row.monthly_payment || 0),
    status: row.status as MockDeal['status'],
    daysOpen: Number(row.days_open || 0),
    dealerNet: Number(row.dealer_net || 0),
    submittedAt: row.submitted_at as string,
    fundedAt: row.funded_at as string | undefined,
    events: (row.events as MockDeal['events']) || [],
  };
}

function mapDealToDb(deal: Partial<MockDeal>): Record<string, unknown> {
  const dbRow: Record<string, unknown> = {};
  if (deal.id !== undefined) dbRow.id = deal.id;
  if (deal.applicationId !== undefined) dbRow.application_id = deal.applicationId;
  if (deal.dealerId !== undefined) dbRow.dealer_id = deal.dealerId;
  if (deal.buyerFirstName !== undefined) dbRow.buyer_first_name = deal.buyerFirstName;
  if (deal.buyerLastInitial !== undefined) dbRow.buyer_last_initial = deal.buyerLastInitial;
  if (deal.vehicle !== undefined) dbRow.vehicle = deal.vehicle;
  if (deal.vin !== undefined) dbRow.vin = deal.vin;
  if (deal.lenderName !== undefined) dbRow.lender_name = deal.lenderName;
  if (deal.amount !== undefined) dbRow.amount = deal.amount;
  if (deal.rate !== undefined) dbRow.rate = deal.rate;
  if (deal.term !== undefined) dbRow.term = deal.term;
  if (deal.monthlyPayment !== undefined) dbRow.monthly_payment = deal.monthlyPayment;
  if (deal.status !== undefined) dbRow.status = deal.status;
  if (deal.daysOpen !== undefined) dbRow.days_open = deal.daysOpen;
  if (deal.dealerNet !== undefined) dbRow.dealer_net = deal.dealerNet;
  if (deal.submittedAt !== undefined) dbRow.submitted_at = deal.submittedAt;
  if (deal.fundedAt !== undefined) dbRow.funded_at = deal.fundedAt;
  if (deal.events !== undefined) dbRow.events = deal.events;
  return dbRow;
}

// --- Activity Events ---
function mapDbToActivityEvent(row: Record<string, unknown>): ActivityEvent {
  return {
    id: row.id as string,
    type: row.type as ActivityEvent['type'],
    timestamp: row.timestamp as string,
    description: row.description as string,
  };
}

// --- Compliance Alerts ---
function mapDbToComplianceAlert(row: Record<string, unknown>): ComplianceAlert {
  return {
    id: row.id as string,
    type: row.type as ComplianceAlert['type'],
    message: row.message as string,
    timestamp: row.timestamp as string,
    action: (row.action as string) || 'View',
    resolved: (row.resolved as boolean) ?? false,
  };
}

// ---------- Notifications ----------

export interface Notification {
  id: string;
  userId: string;
  type: 'new_application' | 'offer_ready' | 'offer_selected' | 'document_requested' | 'deal_funded' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data: Record<string, unknown>;
}

export async function dbGetNotifications(userId: string): Promise<Notification[]> {
  if (!hasDatabaseAccess()) return [];
  const { data, error } = await db()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map(row => ({
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as Notification['type'],
    title: row.title as string,
    message: row.message as string,
    read: row.read as boolean,
    createdAt: row.created_at as string,
    data: (row.data as Record<string, unknown>) || {},
  }));
}

export async function dbCreateNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification | null> {
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db()
    .from('notifications')
    .insert({
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      data: notification.data,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id as string,
    userId: data.user_id as string,
    type: data.type as Notification['type'],
    title: data.title as string,
    message: data.message as string,
    read: data.read as boolean,
    createdAt: data.created_at as string,
    data: (data.data as Record<string, unknown>) || {},
  };
}

export async function dbGetNotification(id: string): Promise<Notification | null> {
  if (!hasDatabaseAccess()) return null;
  const { data, error } = await db()
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id as string,
    userId: data.user_id as string,
    type: data.type as Notification['type'],
    title: data.title as string,
    message: data.message as string,
    read: data.read as boolean,
    createdAt: data.created_at as string,
    data: (data.data as Record<string, unknown>) || {},
  };
}

export async function dbMarkNotificationRead(id: string): Promise<void> {
  if (!hasDatabaseAccess()) return;
  await db().from('notifications').update({ read: true }).eq('id', id);
}

export async function dbMarkAllNotificationsRead(userId: string): Promise<void> {
  if (!hasDatabaseAccess()) return;
  await db().from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}

export async function dbGetUnreadNotificationCount(userId: string): Promise<number> {
  if (!hasDatabaseAccess()) return 0;
  const { count, error } = await db()
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) return 0;
  return count || 0;
}
