-- Car Loan Pro Database Setup
-- Run this in Supabase SQL Editor

-- Copy schema from supabase-schema.sql but add seed data

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'dealer', 'lender', 'admin')),
  entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE SEQUENCE IF NOT EXISTS app_seq START 11;

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY DEFAULT ('APP-' || lpad(nextval('app_seq')::TEXT, 3, '0')),
  user_id UUID REFERENCES users(id),
  borrower JSONB NOT NULL,
  employment JSONB NOT NULL,
  credit JSONB,
  vehicle JSONB NOT NULL,
  deal_structure JSONB NOT NULL,
  loan_amount NUMERIC NOT NULL,
  ltv_percent NUMERIC,
  dti_percent NUMERIC,
  pti_percent NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending_decision',
  state TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  lenders_submitted INT DEFAULT 0,
  offers_received INT DEFAULT 0,
  flags TEXT[] DEFAULT '{}',
  session_token TEXT UNIQUE,
  session_expires_at TIMESTAMPTZ
);

-- Offers table
CREATE SEQUENCE IF NOT EXISTS ofr_seq START 10;

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY DEFAULT ('OFR-' || lpad(nextval('ofr_seq')::TEXT, 3, '0')),
  application_id TEXT REFERENCES applications(id),
  lender_id TEXT,
  lender_name TEXT NOT NULL,
  apr NUMERIC NOT NULL,
  term_months INT NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  approved_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  conditions TEXT[] DEFAULT '{}',
  decision_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Lenders table
CREATE TABLE IF NOT EXISTS lenders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  min_fico INT NOT NULL,
  max_ltv INT NOT NULL,
  max_dti INT NOT NULL,
  max_pti INT NOT NULL,
  min_loan_amount NUMERIC NOT NULL,
  max_loan_amount NUMERIC NOT NULL,
  max_vehicle_age INT NOT NULL,
  max_mileage INT NOT NULL,
  accepts_cpo BOOLEAN DEFAULT TRUE,
  accepts_private_party BOOLEAN DEFAULT FALSE,
  accepts_itin BOOLEAN DEFAULT FALSE,
  states_active TEXT[] DEFAULT '{"All 50"}',
  referral_fee NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  integration_status TEXT DEFAULT 'API',
  avg_decision_time_minutes INT DEFAULT 15,
  rate_tiers JSONB DEFAULT '[]'
);

-- Dealers table
CREATE TABLE IF NOT EXISTS dealers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  contact_email TEXT,
  franchise_brands TEXT[] DEFAULT '{}',
  buyers_sent_mtd INT DEFAULT 0,
  deals_funded_mtd INT DEFAULT 0,
  plan TEXT DEFAULT 'Starter',
  plan_price NUMERIC DEFAULT 299,
  billing_date TEXT,
  status TEXT DEFAULT 'active',
  joined_date TEXT,
  team_members JSONB DEFAULT '[]'
);

-- Deals table
CREATE SEQUENCE IF NOT EXISTS deal_seq START 5;

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY DEFAULT ('DEAL-' || lpad(nextval('deal_seq')::TEXT, 3, '0')),
  application_id TEXT REFERENCES applications(id),
  dealer_id TEXT REFERENCES dealers(id),
  buyer_first_name TEXT NOT NULL,
  buyer_last_initial TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  vin TEXT NOT NULL,
  lender_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  rate NUMERIC NOT NULL,
  term INT NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  days_open INT DEFAULT 0,
  dealer_net NUMERIC DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  funded_at TIMESTAMPTZ,
  events JSONB DEFAULT '[]'
);

-- Activity events
CREATE SEQUENCE IF NOT EXISTS evt_seq START 11;

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY DEFAULT ('EVT-' || lpad(nextval('evt_seq')::TEXT, 3, '0')),
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL
);

-- Compliance alerts
CREATE TABLE IF NOT EXISTS compliance_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE
);

-- Row Level Security policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_state ON applications(state);
CREATE INDEX IF NOT EXISTS idx_applications_session_token ON applications(session_token);
CREATE INDEX IF NOT EXISTS idx_offers_application_id ON offers(application_id);
CREATE INDEX IF NOT EXISTS idx_deals_dealer_id ON deals(dealer_id);
CREATE INDEX IF NOT EXISTS idx_deals_application_id ON deals(application_id);

-- =========================================
-- SEED DATA: 6 Lenders (Prime, Near-Prime, Subprime)
-- =========================================

INSERT INTO lenders (id, name, tier, min_fico, max_ltv, max_dti, max_pti, min_loan_amount, max_loan_amount, max_vehicle_age, max_mileage, accepts_cpo, accepts_private_party, accepts_itin, states_active, referral_fee, is_active, integration_status, avg_decision_time_minutes, rate_tiers) VALUES
('LND-001', 'Ally Financial', 'near_prime', 620, 120, 48, 22, 5000, 75000, 10, 120000, true, true, false, '{"All 50"}', 300, true, 'API', 15,
 '[{"ficoMin": 720, "ficoMax": 850, "rateMin": 3.5, "rateMax": 4.5}, {"ficoMin": 660, "ficoMax": 719, "rateMin": 5.0, "rateMax": 6.5}, {"ficoMin": 620, "ficoMax": 659, "rateMin": 7.0, "rateMax": 9.0}]'::jsonb),

('LND-002', 'Capital One Auto', 'prime', 660, 110, 42, 18, 8000, 100000, 8, 100000, true, false, false, '{"All 50"}', 250, true, 'API', 8,
 '[{"ficoMin": 720, "ficoMax": 850, "rateMin": 3.0, "rateMax": 4.0}, {"ficoMin": 660, "ficoMax": 719, "rateMin": 4.5, "rateMax": 5.5}]'::jsonb),

('LND-003', 'Chase Auto', 'prime', 680, 108, 40, 16, 10000, 150000, 7, 80000, true, false, false, '{"All 50"}', 275, true, 'API', 12,
 '[{"ficoMin": 720, "ficoMax": 850, "rateMin": 2.9, "rateMax": 3.9}, {"ficoMin": 680, "ficoMax": 719, "rateMin": 4.0, "rateMax": 5.0}]'::jsonb),

('LND-004', 'Westlake Financial', 'subprime', 520, 130, 52, 25, 3000, 50000, 12, 150000, true, true, true, '{"All 50"}', 400, true, 'API', 20,
 '[{"ficoMin": 620, "ficoMax": 719, "rateMin": 6.0, "rateMax": 8.0}, {"ficoMin": 520, "ficoMax": 619, "rateMin": 8.0, "rateMax": 14.0}]'::jsonb),

('LND-005', 'Prestige Financial', 'subprime', 500, 128, 50, 24, 3000, 40000, 12, 140000, true, true, true, '{"All 50"}', 380, true, 'Manual', 45,
 '[{"ficoMin": 600, "ficoMax": 719, "rateMin": 7.0, "rateMax": 10.0}, {"ficoMin": 500, "ficoMax": 599, "rateMin": 10.0, "rateMax": 16.0}]'::jsonb),

('LND-006', 'TD Auto Finance', 'near_prime', 630, 118, 46, 20, 5000, 80000, 10, 110000, true, false, false, '{"All 50"}', 290, true, 'API', 18,
 '[{"ficoMin": 720, "ficoMax": 850, "rateMin": 3.8, "rateMax": 4.8}, {"ficoMin": 660, "ficoMax": 719, "rateMin": 5.0, "rateMax": 6.5}, {"ficoMin": 630, "ficoMax": 659, "rateMin": 6.5, "rateMax": 8.5}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
