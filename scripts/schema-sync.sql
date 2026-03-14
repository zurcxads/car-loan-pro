-- Auto Loan Pro schema sync
-- Repairs an existing database so it matches the current application code.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core sequences used by string primary keys
CREATE SEQUENCE IF NOT EXISTS app_seq START 11;
CREATE SEQUENCE IF NOT EXISTS ofr_seq START 10;
CREATE SEQUENCE IF NOT EXISTS deal_seq START 5;
CREATE SEQUENCE IF NOT EXISTS evt_seq START 11;
CREATE SEQUENCE IF NOT EXISTS cal_seq START 1;

-- Users table additions required by the referrals API
ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

UPDATE users
SET referral_code = upper(substr(md5(gen_random_uuid()::text), 1, 8))
WHERE referral_code IS NULL;

ALTER TABLE IF EXISTS users
  ALTER COLUMN referral_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Applications table repairs to match runtime inserts/reads
ALTER TABLE IF EXISTS applications
  ADD COLUMN IF NOT EXISTS has_vehicle BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS session_token TEXT,
  ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMPTZ;

ALTER TABLE IF EXISTS applications
  ALTER COLUMN vehicle DROP NOT NULL,
  ALTER COLUMN loan_amount DROP NOT NULL,
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN session_token DROP NOT NULL,
  ALTER COLUMN session_expires_at DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_user_id_fkey'
      AND conrelid = 'applications'::regclass
  ) THEN
    ALTER TABLE applications
      ADD CONSTRAINT applications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_state ON applications(state);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_session_token ON applications(session_token)
WHERE session_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Offers application foreign key and indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'offers_application_id_fkey'
      AND conrelid = 'offers'::regclass
  ) THEN
    ALTER TABLE offers
      ADD CONSTRAINT offers_application_id_fkey
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_offers_application_id ON offers(application_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- Phase B documents table drift: rename columns, add missing columns, migrate statuses
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'file_path'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'documents'
      AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE documents RENAME COLUMN file_path TO storage_path;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  application_id TEXT,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

ALTER TABLE IF EXISTS documents
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS application_id TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'uploaded',
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

UPDATE documents
SET status = 'verified'
WHERE status = 'approved';

UPDATE documents
SET status = 'uploaded'
WHERE status IS NULL OR status = '';

ALTER TABLE IF EXISTS documents
  ALTER COLUMN application_id DROP NOT NULL,
  ALTER COLUMN user_id DROP NOT NULL,
  ALTER COLUMN file_type DROP NOT NULL,
  ALTER COLUMN storage_path SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'uploaded',
  ALTER COLUMN status SET NOT NULL;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'documents'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE documents DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE documents
  ADD CONSTRAINT documents_status_check
  CHECK (status IN ('uploaded', 'pending', 'verified', 'rejected'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'documents_user_id_fkey'
      AND conrelid = 'documents'::regclass
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT documents_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'documents_application_id_fkey'
      AND conrelid = 'documents'::regclass
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT documents_application_id_fkey
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_app_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Application events used by upload/status flows
CREATE TABLE IF NOT EXISTS application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'application_events_application_id_fkey'
      AND conrelid = 'application_events'::regclass
  ) THEN
    ALTER TABLE application_events
      ADD CONSTRAINT application_events_application_id_fkey
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_application_events_app_id ON application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_created_at ON application_events(created_at DESC);

-- Notifications used by authenticated dashboards
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  application_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notifications_application_id_fkey'
      AND conrelid = 'notifications'::regclass
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_application_id_fkey
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Error logs expected by src/lib/error-tracking.ts
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

ALTER TABLE IF EXISTS error_logs
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS context JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);

-- Tables explicitly required by current runtime code
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  application_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'magic_links_application_id_fkey'
      AND conrelid = 'magic_links'::regclass
  ) THEN
    ALTER TABLE magic_links
      ADD CONSTRAINT magic_links_application_id_fkey
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_application_id ON magic_links(application_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON magic_links(expires_at);

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY DEFAULT ('EVT-' || lpad(nextval('evt_seq')::TEXT, 3, '0')),
  type TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_events_timestamp ON activity_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON activity_events(type);

CREATE TABLE IF NOT EXISTS compliance_alerts (
  id TEXT PRIMARY KEY DEFAULT ('CAL-' || lpad(nextval('cal_seq')::TEXT, 3, '0')),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  action TEXT DEFAULT 'View',
  resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_compliance_alerts_timestamp ON compliance_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_resolved ON compliance_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_compliance_alerts_type ON compliance_alerts(type);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Additional runtime tables needed for API completeness
CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_code TEXT NOT NULL,
  referee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  reward_amount NUMERIC DEFAULT 50,
  reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  funded_at TIMESTAMPTZ
);

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'referrals'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE referrals DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE referrals
  ADD CONSTRAINT referrals_status_check
  CHECK (status IN ('registered', 'applied', 'funded'));

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_code ON referrals(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'webhooks_lender_id_fkey'
      AND conrelid = 'webhooks'::regclass
  ) THEN
    ALTER TABLE webhooks
      ADD CONSTRAINT webhooks_lender_id_fkey
      FOREIGN KEY (lender_id) REFERENCES lenders(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_webhooks_lender_id ON webhooks(lender_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'webhook_deliveries_webhook_id_fkey'
      AND conrelid = 'webhook_deliveries'::regclass
  ) THEN
    ALTER TABLE webhook_deliveries
      ADD CONSTRAINT webhook_deliveries_webhook_id_fkey
      FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success);

-- Storage bucket and policies for document uploads
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
