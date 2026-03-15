// Error tracking and logging system
// Logs to console in dev, sends to Supabase 'error_logs' table in production
//
// Table schema (for reference):
// CREATE TABLE error_logs (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   error TEXT NOT NULL,
//   stack TEXT,
//   url TEXT,
//   user_agent TEXT,
//   session_id TEXT,
//   context JSONB,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

import { supabase, isSupabaseConfigured } from './supabase';

function writeErrorTrackingLog(level: 'error' | 'warn', message: string, metadata?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    return;
  }

  const payload = {
    level,
    message,
    metadata,
    timestamp: new Date().toISOString(),
  };

  try {
    process.stderr.write(`[error-tracking] ${JSON.stringify(payload)}\n`);
  } catch {
    // Ignore logging failures.
  }
}

// In-memory rate limiter: max 10 errors per minute per session
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(): string {
  // Use a session ID from sessionStorage, or create one
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('error-session-id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(7);
    sessionStorage.setItem('error-session-id', sessionId);
  }
  return sessionId;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(key);

  if (!limit || now > limit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + 60000 }); // 1 minute
    return false;
  }

  if (limit.count >= 10) {
    return true;
  }

  limit.count++;
  return false;
}

// Cleanup expired entries every 60 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimits.entries());
    for (const [key, limit] of entries) {
      if (now > limit.resetAt) {
        rateLimits.delete(key);
      }
    }
  }, 60000);
}

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

export async function captureError(
  error: Error | string,
  context?: ErrorContext
): Promise<void> {
  const sessionId = getRateLimitKey();

  // Rate limiting
  if (isRateLimited(sessionId)) {
    return;
  }

  const errorMessage = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;

  // Send to Supabase in production (if configured)
  if (process.env.NODE_ENV === 'production' && isSupabaseConfigured()) {
    try {
      await supabase.from('error_logs').insert({
        error: errorMessage,
        stack: stack || null,
        url: typeof window !== 'undefined' ? window.location.href : null,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
        session_id: sessionId,
        context: context || {},
      });
    } catch (insertError) {
      writeErrorTrackingLog('error', '[Error Tracking] Failed to log error to Supabase', {
        context,
        error: insertError instanceof Error ? insertError.message : String(insertError),
        stack,
      });
    }
  }
}

export function captureException(error: Error, context?: ErrorContext): void {
  captureError(error, context);
}

export function captureMessage(message: string, context?: ErrorContext): void {
  captureError(message, context);
}
