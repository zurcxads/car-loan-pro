// Database abstraction layer
// Falls back to mock data when Supabase is not configured

import { supabase, isSupabaseConfigured } from './supabase';
import {
  MOCK_APPLICATIONS, MOCK_OFFERS, MOCK_LENDERS, MOCK_DEALERS,
  MOCK_DEALS, MOCK_ACTIVITY_EVENTS, MOCK_COMPLIANCE_ALERTS,
  type MockApplication, type MockOffer, type MockLender, type MockDealer,
  type MockDeal, type ActivityEvent, type ComplianceAlert,
} from './mock-data';

// ---------- Applications ----------

export async function dbGetApplications(): Promise<MockApplication[]> {
  if (!isSupabaseConfigured()) return MOCK_APPLICATIONS;
  const { data, error } = await supabase.from('applications').select('*').order('submitted_at', { ascending: false });
  if (error || !data) return MOCK_APPLICATIONS;
  return data.map(mapDbToApp);
}

export async function dbGetApplication(id: string): Promise<MockApplication | null> {
  if (!isSupabaseConfigured()) return MOCK_APPLICATIONS.find(a => a.id === id) || null;
  const { data, error } = await supabase.from('applications').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbToApp(data);
}

export async function dbCreateApplication(app: Partial<MockApplication>): Promise<MockApplication | null> {
  if (!isSupabaseConfigured()) {
    const newApp = { ...app, id: `APP-${String(MOCK_APPLICATIONS.length + 1).padStart(3, '0')}` } as MockApplication;
    MOCK_APPLICATIONS.push(newApp);
    return newApp;
  }
  const { data, error } = await supabase.from('applications').insert(mapAppToDb(app)).select().single();
  if (error || !data) return null;
  return mapDbToApp(data);
}

export async function dbUpdateApplication(id: string, updates: Partial<MockApplication>): Promise<MockApplication | null> {
  if (!isSupabaseConfigured()) {
    const idx = MOCK_APPLICATIONS.findIndex(a => a.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_APPLICATIONS[idx], updates, { updatedAt: new Date().toISOString() });
    return MOCK_APPLICATIONS[idx];
  }
  const { data, error } = await supabase.from('applications').update(mapAppToDb(updates)).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToApp(data);
}

// ---------- Offers ----------

export async function dbGetOffers(applicationId?: string): Promise<MockOffer[]> {
  if (!isSupabaseConfigured()) {
    return applicationId ? MOCK_OFFERS.filter(o => o.applicationId === applicationId) : MOCK_OFFERS;
  }
  let query = supabase.from('offers').select('*');
  if (applicationId) query = query.eq('application_id', applicationId);
  const { data, error } = await query.order('apr', { ascending: true });
  if (error || !data) return applicationId ? MOCK_OFFERS.filter(o => o.applicationId === applicationId) : MOCK_OFFERS;
  return data.map(mapDbToOffer);
}

export async function dbCreateOffer(offer: Partial<MockOffer>): Promise<MockOffer | null> {
  if (!isSupabaseConfigured()) {
    const newOffer = { ...offer, id: `OFR-${String(MOCK_OFFERS.length + 1).padStart(3, '0')}` } as MockOffer;
    MOCK_OFFERS.push(newOffer);
    return newOffer;
  }
  const { data, error } = await supabase.from('offers').insert(mapOfferToDb(offer)).select().single();
  if (error || !data) return null;
  return mapDbToOffer(data);
}

export async function dbUpdateOffer(id: string, updates: Partial<MockOffer>): Promise<MockOffer | null> {
  if (!isSupabaseConfigured()) {
    const idx = MOCK_OFFERS.findIndex(o => o.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_OFFERS[idx], updates);
    return MOCK_OFFERS[idx];
  }
  const { data, error } = await supabase.from('offers').update(mapOfferToDb(updates)).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToOffer(data);
}

// ---------- Lenders ----------

export async function dbGetLenders(): Promise<MockLender[]> {
  if (!isSupabaseConfigured()) return MOCK_LENDERS;
  const { data, error } = await supabase.from('lenders').select('*');
  if (error || !data) return MOCK_LENDERS;
  return data.map(mapDbToLender);
}

export async function dbGetLender(id: string): Promise<MockLender | null> {
  if (!isSupabaseConfigured()) return MOCK_LENDERS.find(l => l.id === id) || null;
  const { data, error } = await supabase.from('lenders').select('*').eq('id', id).single();
  if (error || !data) return null;
  return mapDbToLender(data);
}

export async function dbUpdateLender(id: string, updates: Partial<MockLender>): Promise<MockLender | null> {
  if (!isSupabaseConfigured()) {
    const idx = MOCK_LENDERS.findIndex(l => l.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_LENDERS[idx], updates);
    return MOCK_LENDERS[idx];
  }
  const { data, error } = await supabase.from('lenders').update(updates).eq('id', id).select().single();
  if (error || !data) return null;
  return mapDbToLender(data);
}

// ---------- Dealers ----------

export async function dbGetDealers(): Promise<MockDealer[]> {
  if (!isSupabaseConfigured()) return MOCK_DEALERS;
  const { data, error } = await supabase.from('dealers').select('*');
  if (error || !data) return MOCK_DEALERS;
  return data;
}

export async function dbGetDealer(id: string): Promise<MockDealer | null> {
  if (!isSupabaseConfigured()) return MOCK_DEALERS.find(d => d.id === id) || null;
  const { data, error } = await supabase.from('dealers').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data;
}

export async function dbUpdateDealer(id: string, updates: Partial<MockDealer>): Promise<MockDealer | null> {
  if (!isSupabaseConfigured()) {
    const idx = MOCK_DEALERS.findIndex(d => d.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_DEALERS[idx], updates);
    return MOCK_DEALERS[idx];
  }
  const { data, error } = await supabase.from('dealers').update(updates).eq('id', id).select().single();
  if (error || !data) return null;
  return data;
}

// ---------- Deals ----------

export async function dbGetDeals(dealerId?: string): Promise<MockDeal[]> {
  if (!isSupabaseConfigured()) {
    return dealerId ? MOCK_DEALS.filter(d => d.dealerId === dealerId) : MOCK_DEALS;
  }
  let query = supabase.from('deals').select('*');
  if (dealerId) query = query.eq('dealer_id', dealerId);
  const { data, error } = await query;
  if (error || !data) return dealerId ? MOCK_DEALS.filter(d => d.dealerId === dealerId) : MOCK_DEALS;
  return data;
}

export async function dbCreateDeal(deal: Partial<MockDeal>): Promise<MockDeal | null> {
  if (!isSupabaseConfigured()) {
    const newDeal = { ...deal, id: `DEAL-${String(MOCK_DEALS.length + 1).padStart(3, '0')}` } as MockDeal;
    MOCK_DEALS.push(newDeal);
    return newDeal;
  }
  const { data, error } = await supabase.from('deals').insert(deal).select().single();
  if (error || !data) return null;
  return data;
}

export async function dbUpdateDeal(id: string, updates: Partial<MockDeal>): Promise<MockDeal | null> {
  if (!isSupabaseConfigured()) {
    const idx = MOCK_DEALS.findIndex(d => d.id === id);
    if (idx === -1) return null;
    Object.assign(MOCK_DEALS[idx], updates);
    return MOCK_DEALS[idx];
  }
  const { data, error } = await supabase.from('deals').update(updates).eq('id', id).select().single();
  if (error || !data) return null;
  return data;
}

// ---------- Activity Events ----------

export async function dbGetActivityEvents(): Promise<ActivityEvent[]> {
  if (!isSupabaseConfigured()) return MOCK_ACTIVITY_EVENTS;
  const { data, error } = await supabase.from('activity_events').select('*').order('timestamp', { ascending: false });
  if (error || !data) return MOCK_ACTIVITY_EVENTS;
  return data;
}

export async function dbCreateActivityEvent(event: Omit<ActivityEvent, 'id'>): Promise<void> {
  if (!isSupabaseConfigured()) {
    MOCK_ACTIVITY_EVENTS.unshift({ ...event, id: `EVT-${String(MOCK_ACTIVITY_EVENTS.length + 1).padStart(3, '0')}` });
    return;
  }
  await supabase.from('activity_events').insert(event);
}

// ---------- Compliance ----------

export async function dbGetComplianceAlerts(): Promise<ComplianceAlert[]> {
  if (!isSupabaseConfigured()) return MOCK_COMPLIANCE_ALERTS;
  const { data, error } = await supabase.from('compliance_alerts').select('*').order('timestamp', { ascending: false });
  if (error || !data) return MOCK_COMPLIANCE_ALERTS;
  return data;
}

// ---------- Stats ----------

export async function dbGetPlatformStats() {
  if (!isSupabaseConfigured()) {
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
  // Would aggregate from Supabase in production
  return {
    totalApplications: 0, pendingApplications: 0, totalOffers: 0,
    totalLenders: 0, activeLenders: 0, totalDealsFunded: 0,
    totalVolumeFunded: 0, avgApprovalRate: 0,
  };
}

// ---------- Mapper helpers (Supabase snake_case <-> app camelCase) ----------

function mapDbToApp(row: Record<string, unknown>): MockApplication {
  // When Supabase is active, map snake_case columns to camelCase
  // For now, passthrough since mock data already uses correct shape
  return row as unknown as MockApplication;
}

function mapAppToDb(app: Partial<MockApplication>): Record<string, unknown> {
  return app as unknown as Record<string, unknown>;
}

function mapDbToOffer(row: Record<string, unknown>): MockOffer {
  return row as unknown as MockOffer;
}

function mapOfferToDb(offer: Partial<MockOffer>): Record<string, unknown> {
  return offer as unknown as Record<string, unknown>;
}

function mapDbToLender(row: Record<string, unknown>): MockLender {
  return row as unknown as MockLender;
}
