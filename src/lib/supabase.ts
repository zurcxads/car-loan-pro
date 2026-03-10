import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Lazy-init client — only create when actually configured
let _client: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!isSupabaseConfigured()) {
      // Return a no-op that mimics Supabase's chainable API
      const noop = () => ({ data: null, error: { message: 'Supabase not configured' } });
      const chain: Record<string, unknown> = {};
      const handler: ProxyHandler<Record<string, unknown>> = {
        get: () => new Proxy(chain, handler),
        apply: () => new Proxy(chain, handler),
      };
      const chainProxy = new Proxy(noop, {
        apply: () => new Proxy(chain, handler),
        get: () => new Proxy(noop, { apply: () => new Proxy(chain, handler), get: () => chainProxy }),
      });
      return chainProxy;
    }
    if (!_client) {
      _client = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (_client as unknown as Record<string, unknown>)[prop as string];
  },
});

// Server-side client with service role key for API routes
export function getServiceClient(): SupabaseClient {
  if (!isSupabaseConfigured()) return supabase;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceKey);
}
