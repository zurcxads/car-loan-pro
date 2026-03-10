-- EZ Car Loans - Full Schema
-- Run this in Supabase SQL Editor

-- Sequences
CREATE SEQUENCE IF NOT EXISTS app_seq START 1;
CREATE SEQUENCE IF NOT EXISTS offer_seq START 1;
CREATE SEQUENCE IF NOT EXISTS deal_seq START 1;

-- Users table (for NextAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT ('usr_' || gen_random_uuid()::TEXT),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'lender', 'dealer', 'consumer')),
  entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lenders
CREATE TABLE IF NOT EXISTS lenders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  tier TEXT[] DEFAULT '{}',
  min_fico INT DEFAULT 500,
  max_ltv NUMERIC DEFAULT 150,
  max_dti NUMERIC DEFAULT 50,
  states TEXT[] DEFAULT '{}',
  min_loan NUMERIC DEFAULT 5000,
  max_loan NUMERIC DEFAULT 100000,
  approval_rate NUMERIC DEFAULT 50,
  avg_decision_hrs NUMERIC DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dealers
CREATE TABLE IF NOT EXISTS dealers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  dealer_type TEXT DEFAULT 'franchise',
  active_buyers INT DEFAULT 0,
  deals_closed INT DEFAULT 0,
  avg_deal_size NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY DEFAULT ('APP-' || lpad(nextval('app_seq')::TEXT, 3, '0')),
  borrower JSONB NOT NULL DEFAULT '{}',
  employment JSONB NOT NULL DEFAULT '{}',
  credit JSONB NOT NULL DEFAULT '{}',
  vehicle JSONB NOT NULL DEFAULT '{}',
  deal_structure JSONB NOT NULL DEFAULT '{}',
  loan_amount NUMERIC,
  ltv_percent NUMERIC,
  dti_percent NUMERIC,
  pti_percent NUMERIC,
  status TEXT DEFAULT 'pending_decision' CHECK (status IN ('pending_decision', 'offers_available', 'conditional', 'funded', 'declined')),
  state TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  lenders_submitted INT DEFAULT 0,
  offers_received INT DEFAULT 0,
  flags TEXT[] DEFAULT '{}'
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY DEFAULT ('OFR-' || lpad(nextval('offer_seq')::TEXT, 3, '0')),
  application_id TEXT REFERENCES applications(id),
  lender_id TEXT REFERENCES lenders(id),
  lender_name TEXT,
  apr NUMERIC NOT NULL,
  term_months INT NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_cost NUMERIC,
  down_payment_required NUMERIC DEFAULT 0,
  max_advance NUMERIC,
  stipulations TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'conditional', 'declined', 'selected')),
  expires_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY DEFAULT ('DEAL-' || lpad(nextval('deal_seq')::TEXT, 3, '0')),
  application_id TEXT REFERENCES applications(id),
  offer_id TEXT REFERENCES offers(id),
  dealer_id TEXT REFERENCES dealers(id),
  lender_id TEXT REFERENCES lenders(id),
  buyer_name TEXT,
  vehicle TEXT,
  amount NUMERIC,
  apr NUMERIC,
  term INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'docs_sent', 'funded', 'cancelled')),
  vin TEXT,
  funded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activity Events
CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY DEFAULT ('EVT-' || gen_random_uuid()::TEXT),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  actor TEXT,
  entity_type TEXT,
  entity_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Compliance Alerts
CREATE TABLE IF NOT EXISTS compliance_alerts (
  id TEXT PRIMARY KEY DEFAULT ('CMP-' || gen_random_uuid()::TEXT),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  resolved BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_offers_application ON offers(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_lender ON offers(lender_id);
CREATE INDEX IF NOT EXISTS idx_deals_dealer ON deals(dealer_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_events(timestamp DESC);

-- RLS Policies (basic - expand later)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use service role key)
CREATE POLICY "Service role full access" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON lenders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON dealers FOR ALL USING (true) WITH CHECK (true);
