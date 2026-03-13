import { setupDatabase } from '@/lib/setup-db';
import { apiSuccess, apiError } from '@/lib/api-helpers';

// POST /api/setup-db
// Run this once to initialize the Supabase database with schema and seed data
export async function POST() {
  try {
    const result = await setupDatabase();
    return apiSuccess(result);
  } catch (error) {
    console.error('Database setup failed:', error);
    return apiError(error instanceof Error ? error.message : 'Database setup failed', 500);
  }
}
