import { setupDatabase } from '@/lib/setup-db';
import { apiSuccess, apiError, requireAuth } from '@/lib/api-helpers';

// POST /api/setup-db
// Run this once to initialize the Supabase database with schema and seed data
// CRITICAL: Requires admin authentication and blocks in production
export async function POST() {
  // Block in production for safety
  if (process.env.NODE_ENV === 'production') {
    return apiError('Database setup not available in production', 403);
  }

  // Require admin authentication even in development
  const { error: authError } = await requireAuth('admin');
  if (authError) return authError;

  try {
    const result = await setupDatabase();
    return apiSuccess(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database setup failed';
    console.error('Database setup failed:', error);
    return apiError(message, 500);
  }
}
