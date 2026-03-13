// Application Events Helper
// Creates and tracks lifecycle events for applications

import { supabase, isSupabaseConfigured } from './supabase';

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type:
    | 'submitted'
    | 'lender_matched'
    | 'offer_received'
    | 'offer_selected'
    | 'documents_requested'
    | 'document_uploaded'
    | 'document_approved'
    | 'document_rejected'
    | 'approved'
    | 'funded';
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Create an application event
 */
export async function createApplicationEvent(
  applicationId: string,
  eventType: ApplicationEvent['event_type'],
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<ApplicationEvent | null> {
  if (!isSupabaseConfigured()) {
    // In dev mode, just log the event
    console.log(`📌 Application Event: ${eventType} - ${description}`, metadata);
    return {
      id: crypto.randomUUID(),
      application_id: applicationId,
      event_type: eventType,
      description,
      metadata,
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('application_events')
    .insert({
      application_id: applicationId,
      event_type: eventType,
      description,
      metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create application event:', error);
    return null;
  }

  return data as ApplicationEvent;
}

/**
 * Get all events for an application
 */
export async function getApplicationEvents(applicationId: string): Promise<ApplicationEvent[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const { data, error } = await supabase
    .from('application_events')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch application events:', error);
    return [];
  }

  return data as ApplicationEvent[];
}
