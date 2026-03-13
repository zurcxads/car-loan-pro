-- Car Loan Pro Database Schema (Production)
-- Run this in Supabase SQL Editor

-- Sequences
CREATE SEQUENCE IF NOT EXISTS app_seq START 11;
CREATE SEQUENCE IF NOT EXISTS ofr_seq START 10;
CREATE SEQUENCE IF NOT EXISTS deal_seq START 5;
CREATE SEQUENCE IF NOT EXISTS evt_seq START 11;

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

-- Notifications table
CREATE SEQUENCE IF NOT EXISTS notif_seq START 1;
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT ('NOTIF-' || lpad(nextval('notif_seq')::TEXT, 5, '0')),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('new_application', 'offer_ready', 'offer_selected', 'document_requested', 'deal_funded', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_state ON applications(state);
CREATE INDEX IF NOT EXISTS idx_offers_application_id ON offers(application_id);
CREATE INDEX IF NOT EXISTS idx_deals_dealer_id ON deals(dealer_id);
CREATE INDEX IF NOT EXISTS idx_deals_application_id ON deals(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role key)
CREATE POLICY "Service role full access" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON lenders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON dealers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON notifications FOR ALL USING (true) WITH CHECK (true);
