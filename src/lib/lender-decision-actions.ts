import { z } from 'zod';
import {
  appendApplicationMetadataMessage,
  appendApplicationTimelineEntry,
  normalizeApplicationMetadata,
} from '@/lib/application-metadata';
import { dbCreateOffer, dbGetApplication, dbGetOffer, dbUpdateApplication, dbUpdateOffer, getServiceClient } from '@/lib/db';
import { getLenderActiveApplication } from '@/lib/lender-applications';
import type { MockApplication, MockOffer } from '@/lib/mock-data';
import { serverLogger } from '@/lib/server-logger';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { ApplicationMetadata } from '@/lib/types';

export const approveApplicationSchema = z.object({
  lenderId: z.string().min(1),
  notes: z.string().trim().min(1).max(2000).optional(),
}).strict();

export const declineApplicationSchema = z.object({
  lenderId: z.string().min(1),
  reason: z.string().trim().min(1).max(2000).optional(),
}).strict();

export const counterApplicationSchema = z.object({
  lenderId: z.string().min(1),
  apr: z.number().positive().max(100),
  term: z.number().int().positive().max(120),
  monthlyPayment: z.number().positive(),
  amount: z.number().positive(),
  conditions: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
}).strict();

export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;
export type DeclineApplicationInput = z.infer<typeof declineApplicationSchema>;
export type CounterApplicationInput = z.infer<typeof counterApplicationSchema>;

export type LenderOwnedApplication = {
  application: MockApplication;
  lockedOffer: MockOffer;
};

type DecisionActor = {
  lenderId: string;
  lenderName: string;
};

type SupabaseOfferInsert = {
  application_id: string;
  approved_amount: number;
  apr: number;
  conditions: string[];
  decision_at: string;
  expires_at: string;
  lender_id: string;
  lender_name: string;
  monthly_payment: number;
  status: MockOffer['status'];
  term_months: number;
};

export async function getOwnedApplicationForLenderDecision(
  lenderId: string,
  applicationId: string
): Promise<LenderOwnedApplication | null> {
  return getLenderActiveApplication(lenderId, applicationId);
}

export function buildLenderDecisionMetadata(
  metadata: MockApplication['metadata'],
  actor: DecisionActor,
  entry: {
    details?: Record<string, unknown>;
    message: string;
    type: 'lender_approved' | 'lender_declined' | 'lender_countered';
  }
): ApplicationMetadata {
  const withMessage = appendApplicationMetadataMessage(normalizeApplicationMetadata(metadata), {
    actorId: actor.lenderId,
    actorName: actor.lenderName,
    actorRole: 'lender',
    message: entry.message,
  });

  return appendApplicationTimelineEntry(withMessage, {
    actorId: actor.lenderId,
    actorName: actor.lenderName,
    actorRole: 'lender',
    details: entry.details,
    type: entry.type,
  });
}

export async function updateApplicationRecord(
  applicationId: string,
  updates: Partial<MockApplication>
): Promise<MockApplication | null> {
  if (!isSupabaseConfigured()) {
    return dbUpdateApplication(applicationId, updates);
  }

  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from('applications')
    .update({
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.metadata !== undefined ? { metadata: updates.metadata } : {}),
      ...(updates.lockedOfferId !== undefined ? { locked_offer_id: updates.lockedOfferId } : {}),
      ...(updates.offerLockedAt !== undefined ? { offer_locked_at: updates.offerLockedAt } : {}),
      ...(updates.offerExpiresAt !== undefined ? { offer_expires_at: updates.offerExpiresAt } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error || !data) {
    serverLogger.error('Failed to update application for lender decision', {
      applicationId,
      error: error?.message ?? 'Unknown error',
    });
    return null;
  }

  return dbGetApplication(applicationId);
}

export async function updateOfferRecord(
  offerId: string,
  updates: Partial<MockOffer>
): Promise<MockOffer | null> {
  if (!isSupabaseConfigured()) {
    return dbUpdateOffer(offerId, updates);
  }

  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from('offers')
    .update({
      ...(updates.approvedAmount !== undefined ? { approved_amount: updates.approvedAmount } : {}),
      ...(updates.apr !== undefined ? { apr: updates.apr } : {}),
      ...(updates.conditions !== undefined ? { conditions: updates.conditions } : {}),
      ...(updates.decisionAt !== undefined ? { decision_at: updates.decisionAt } : {}),
      ...(updates.expiresAt !== undefined ? { expires_at: updates.expiresAt } : {}),
      ...(updates.lockedAt !== undefined ? { locked_at: updates.lockedAt } : {}),
      ...(updates.monthlyPayment !== undefined ? { monthly_payment: updates.monthlyPayment } : {}),
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.termMonths !== undefined ? { term_months: updates.termMonths } : {}),
    })
    .eq('id', offerId)
    .select('*')
    .single();

  if (error || !data) {
    serverLogger.error('Failed to update offer for lender decision', {
      error: error?.message ?? 'Unknown error',
      offerId,
    });
    return null;
  }

  return dbGetOffer(offerId);
}

export async function createCounterOfferRecord(
  application: MockApplication,
  lockedOffer: MockOffer,
  input: CounterApplicationInput
): Promise<MockOffer | null> {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  if (!isSupabaseConfigured()) {
    return dbCreateOffer({
      applicationId: application.id,
      approvedAmount: input.amount,
      apr: input.apr,
      conditions: input.conditions ?? [],
      decisionAt: now,
      expiresAt,
      lenderId: input.lenderId,
      lenderName: lockedOffer.lenderName,
      monthlyPayment: input.monthlyPayment,
      status: 'conditional',
      termMonths: input.term,
    });
  }

  const insertPayload: SupabaseOfferInsert = {
    application_id: application.id,
    approved_amount: input.amount,
    apr: input.apr,
    conditions: input.conditions ?? [],
    decision_at: now,
    expires_at: expiresAt,
    lender_id: input.lenderId,
    lender_name: lockedOffer.lenderName,
    monthly_payment: input.monthlyPayment,
    status: 'conditional',
    term_months: input.term,
  };

  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient
    .from('offers')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !data) {
    serverLogger.error('Failed to create counter offer', {
      applicationId: application.id,
      error: error?.message ?? 'Unknown error',
      lenderId: input.lenderId,
    });
    return null;
  }

  return {
    applicationId: data.application_id as string,
    approvedAmount: Number(data.approved_amount ?? 0),
    apr: Number(data.apr ?? 0),
    conditions: Array.isArray(data.conditions) ? (data.conditions as string[]) : [],
    decisionAt: data.decision_at as string,
    expiresAt: data.expires_at as string,
    id: data.id as string,
    lenderId: data.lender_id as string,
    lenderName: data.lender_name as string,
    monthlyPayment: Number(data.monthly_payment ?? 0),
    status: data.status as MockOffer['status'],
    termMonths: Number(data.term_months ?? 0),
  };
}
