// Setup Database Schema and Seed Data
// Run this once to initialize Supabase database with schema and seed data
// Usage: import and call setupDatabase() from a server-side API route

import { createClient } from '@supabase/supabase-js';

export async function setupDatabase() {
  // Use service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });



  try {
    // Check if lenders table already has data
    const { data: existingLenders } = await supabase.from('lenders').select('id').limit(1);

    if (existingLenders && existingLenders.length > 0) {
      return { success: true, message: 'Database already initialized' };
    }

    // Insert 6 lenders with realistic underwriting rules and rate tiers
    const lenders = [
      {
        id: 'LND-001',
        name: 'Ally Financial',
        tier: 'near_prime',
        min_fico: 620,
        max_ltv: 120,
        max_dti: 48,
        max_pti: 22,
        min_loan_amount: 5000,
        max_loan_amount: 75000,
        max_vehicle_age: 10,
        max_mileage: 120000,
        accepts_cpo: true,
        accepts_private_party: true,
        accepts_itin: false,
        states_active: ['All 50'],
        referral_fee: 300,
        is_active: true,
        integration_status: 'API',
        avg_decision_time_minutes: 15,
        rate_tiers: [
          { ficoMin: 720, ficoMax: 850, rateMin: 3.5, rateMax: 4.5 },
          { ficoMin: 660, ficoMax: 719, rateMin: 5.0, rateMax: 6.5 },
          { ficoMin: 620, ficoMax: 659, rateMin: 7.0, rateMax: 9.0 },
        ],
      },
      {
        id: 'LND-002',
        name: 'Capital One Auto',
        tier: 'prime',
        min_fico: 660,
        max_ltv: 110,
        max_dti: 42,
        max_pti: 18,
        min_loan_amount: 8000,
        max_loan_amount: 100000,
        max_vehicle_age: 8,
        max_mileage: 100000,
        accepts_cpo: true,
        accepts_private_party: false,
        accepts_itin: false,
        states_active: ['All 50'],
        referral_fee: 250,
        is_active: true,
        integration_status: 'API',
        avg_decision_time_minutes: 8,
        rate_tiers: [
          { ficoMin: 720, ficoMax: 850, rateMin: 3.0, rateMax: 4.0 },
          { ficoMin: 660, ficoMax: 719, rateMin: 4.5, rateMax: 5.5 },
        ],
      },
      {
        id: 'LND-003',
        name: 'Chase Auto',
        tier: 'prime',
        min_fico: 680,
        max_ltv: 108,
        max_dti: 40,
        max_pti: 16,
        min_loan_amount: 10000,
        max_loan_amount: 150000,
        max_vehicle_age: 7,
        max_mileage: 80000,
        accepts_cpo: true,
        accepts_private_party: false,
        accepts_itin: false,
        states_active: ['All 50'],
        referral_fee: 275,
        is_active: true,
        integration_status: 'API',
        avg_decision_time_minutes: 12,
        rate_tiers: [
          { ficoMin: 720, ficoMax: 850, rateMin: 2.9, rateMax: 3.9 },
          { ficoMin: 680, ficoMax: 719, rateMin: 4.0, rateMax: 5.0 },
        ],
      },
      {
        id: 'LND-004',
        name: 'Westlake Financial',
        tier: 'subprime',
        min_fico: 520,
        max_ltv: 130,
        max_dti: 52,
        max_pti: 25,
        min_loan_amount: 3000,
        max_loan_amount: 50000,
        max_vehicle_age: 12,
        max_mileage: 150000,
        accepts_cpo: true,
        accepts_private_party: true,
        accepts_itin: true,
        states_active: ['All 50'],
        referral_fee: 400,
        is_active: true,
        integration_status: 'API',
        avg_decision_time_minutes: 20,
        rate_tiers: [
          { ficoMin: 620, ficoMax: 719, rateMin: 6.0, rateMax: 8.0 },
          { ficoMin: 520, ficoMax: 619, rateMin: 8.0, rateMax: 14.0 },
        ],
      },
      {
        id: 'LND-005',
        name: 'Prestige Financial',
        tier: 'subprime',
        min_fico: 500,
        max_ltv: 128,
        max_dti: 50,
        max_pti: 24,
        min_loan_amount: 3000,
        max_loan_amount: 40000,
        max_vehicle_age: 12,
        max_mileage: 140000,
        accepts_cpo: true,
        accepts_private_party: true,
        accepts_itin: true,
        states_active: ['All 50'],
        referral_fee: 380,
        is_active: true,
        integration_status: 'Manual',
        avg_decision_time_minutes: 45,
        rate_tiers: [
          { ficoMin: 600, ficoMax: 719, rateMin: 7.0, rateMax: 10.0 },
          { ficoMin: 500, ficoMax: 599, rateMin: 10.0, rateMax: 16.0 },
        ],
      },
      {
        id: 'LND-006',
        name: 'TD Auto Finance',
        tier: 'near_prime',
        min_fico: 630,
        max_ltv: 118,
        max_dti: 46,
        max_pti: 20,
        min_loan_amount: 5000,
        max_loan_amount: 80000,
        max_vehicle_age: 10,
        max_mileage: 110000,
        accepts_cpo: true,
        accepts_private_party: false,
        accepts_itin: false,
        states_active: ['All 50'],
        referral_fee: 290,
        is_active: true,
        integration_status: 'API',
        avg_decision_time_minutes: 18,
        rate_tiers: [
          { ficoMin: 720, ficoMax: 850, rateMin: 3.8, rateMax: 4.8 },
          { ficoMin: 660, ficoMax: 719, rateMin: 5.0, rateMax: 6.5 },
          { ficoMin: 630, ficoMax: 659, rateMin: 6.5, rateMax: 8.5 },
        ],
      },
    ];

    const { error: lendersError } = await supabase.from('lenders').insert(lenders);

    if (lendersError) {
      console.error('Error inserting lenders:', lendersError);
      throw lendersError;
    }

    return {
      success: true,
      message: 'Database schema applied and seeded with 6 lenders',
    };
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}
