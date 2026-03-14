-- Auto Loan Pro full schema
-- Run on a fresh Supabase project to create all required tables, indexes, and storage policies.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SEQUENCE IF NOT EXISTS app_seq START 11;
CREATE SEQUENCE IF NOT EXISTS ofr_seq START 10;
CREATE SEQUENCE IF NOT EXISTS deal_seq START 5;
CREATE SEQUENCE IF NOT EXISTS evt_seq START 11;
CREATE SEQUENCE IF NOT EXISTS cal_seq START 1;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'dealer', 'lender', 'admin')),
  entity_id TEXT,
  referral_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY DEFAULT ('APP-' || lpad(nextval('app_seq')::TEXT, 3, '0')),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  borrower JSONB NOT NULL,
  employment JSONB NOT NULL,
  credit JSONB,
  vehicle JSONB,
  deal_structure JSONB NOT NULL,
  loan_amount NUMERIC,
  ltv_percent NUMERIC,
  dti_percent NUMERIC,
  pti_percent NUMERIC,
  has_vehicle BOOLEAN DEFAULT FALSE,
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

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY DEFAULT ('OFR-' || lpad(nextval('ofr_seq')::TEXT, 3, '0')),
  application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY DEFAULT ('DEAL-' || lpad(nextval('deal_seq')::TEXT, 3, '0')),
  application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  application_id TEXT REFERENCES applications(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  application_id TEXT REFERENCES applications(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  user_agent TEXT,
  user_id TEXT,
  session_id TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY DEFAULT ('EVT-' || lpad(nextval('evt_seq')::TEXT, 3, '0')),
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS compliance_alerts (
  id TEXT PRIMARY KEY DEFAULT ('CAL-' || lpad(nextval('cal_seq')::TEXT, 3, '0')),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT DEFAULT 'View',
  resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_code TEXT NOT NULL,
  referee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'applied', 'funded')),
  reward_amount NUMERIC DEFAULT 50,
  reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  funded_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id TEXT NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_state ON applications(state);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_session_token ON applications(session_token)
WHERE session_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_application_id ON offers(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_deals_dealer_id ON deals(dealer_id);
CREATE INDEX IF NOT EXISTS idx_deals_application_id ON deals(application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_app_id ON application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_created_at ON application_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_app_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_application_id ON magic_links(application_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_events_timestamp ON activity_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON activity_events(type);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_timestamp ON compliance_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_resolved ON compliance_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_type ON compliance_alerts(type);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_code ON referrals(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_lender_id ON webhooks(lender_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success);

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload to their application folder'
  ) THEN
    CREATE POLICY "Users can upload to their application folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'documents'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can read their own documents'
  ) THEN
    CREATE POLICY "Users can read their own documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'documents'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can read all documents'
  ) THEN
    CREATE POLICY "Admins can read all documents"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'documents'
      AND EXISTS (
        SELECT 1
        FROM auth.users
        WHERE auth.users.id = auth.uid()
          AND auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    );
  END IF;
END $$;
