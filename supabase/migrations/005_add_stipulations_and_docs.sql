-- Migration: Add Stipulations, Documents, Platform Settings, and Messages
-- This adds the core infrastructure for the stipulation engine and document workflow

-- Stipulations table (auto-generated requirements per application)
CREATE TABLE IF NOT EXISTS stipulations (
  id TEXT PRIMARY KEY DEFAULT ('STIP-' || lpad(nextval('evt_seq')::TEXT, 5, '0')),
  application_id TEXT REFERENCES applications(id) NOT NULL,
  type TEXT NOT NULL, -- 'paystub', 'bank_statement', 'tax_return', 'proof_of_residence', 'employment_letter', 'id_verification', 'co_signer', 'other'
  title TEXT NOT NULL, -- Display title for consumer
  description TEXT NOT NULL, -- What they need to provide
  required BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending_upload', -- 'pending_upload', 'uploaded', 'under_review', 'verified', 'rejected'
  rejection_reason TEXT, -- If rejected, why
  quantity_required INT DEFAULT 1, -- e.g., "2 recent paystubs"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table (uploaded files per stipulation)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT ('DOC-' || lpad(nextval('evt_seq')::TEXT, 5, '0')),
  application_id TEXT REFERENCES applications(id) NOT NULL,
  stipulation_id TEXT REFERENCES stipulations(id), -- NULL if general upload
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'application/pdf', 'image/jpeg', etc.
  file_size INT NOT NULL, -- bytes
  storage_path TEXT NOT NULL, -- Supabase Storage path
  status TEXT NOT NULL DEFAULT 'pending_review', -- 'pending_review', 'verified', 'rejected'
  rejection_reason TEXT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT -- Admin notes
);

-- Application messages (for follow-up questions / conversation thread)
CREATE TABLE IF NOT EXISTS application_messages (
  id TEXT PRIMARY KEY DEFAULT ('MSG-' || lpad(nextval('evt_seq')::TEXT, 5, '0')),
  application_id TEXT REFERENCES applications(id) NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('consumer', 'admin', 'lender', 'system')),
  sender_id UUID REFERENCES users(id), -- NULL for system messages
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'question', 'response', 'status_update'
  is_question BOOLEAN DEFAULT FALSE, -- If admin is asking a question
  parent_message_id TEXT REFERENCES application_messages(id), -- For threaded responses
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform settings (key-value store for admin controls)
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'stipulation_rules', 'application_settings', 'lender_settings', 'platform_settings'
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for platform settings changes
CREATE TABLE IF NOT EXISTS settings_audit_log (
  id TEXT PRIMARY KEY DEFAULT ('AUDIT-' || lpad(nextval('evt_seq')::TEXT, 5, '0')),
  setting_key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES users(id) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT
);

-- Add approval_type to applications (conditional vs clean)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS approval_type TEXT DEFAULT 'conditional' CHECK (approval_type IN ('conditional', 'clean', 'none'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS stipulations_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS manual_review_required BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS review_priority INT DEFAULT 0; -- Higher = more urgent
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stipulations_application_id ON stipulations(application_id);
CREATE INDEX IF NOT EXISTS idx_stipulations_status ON stipulations(status);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_stipulation_id ON documents(stipulation_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_application_messages_application_id ON application_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_application_messages_read ON application_messages(read);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);

-- Row Level Security
ALTER TABLE stipulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access stipulations" ON stipulations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access documents" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access messages" ON application_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access settings" ON platform_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access audit" ON settings_audit_log FOR ALL USING (true) WITH CHECK (true);

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description, category) VALUES
  ('stipulation_rules', '{
    "fico_720_plus": {"stips": [], "auto_approve": true},
    "fico_660_719": {"stips": ["paystub_2"], "auto_approve": false},
    "fico_580_659": {"stips": ["bank_statement_3", "proof_of_residence"], "auto_approve": false},
    "fico_below_580": {"stips": ["bank_statement_3", "proof_of_residence", "co_signer_encouraged"], "auto_approve": false},
    "self_employed": {"stips": ["bank_statement_3", "tax_return_1"], "auto_approve": false},
    "employment_lt_6_months": {"stips": ["employment_letter"], "auto_approve": false},
    "income_gt_8000": {"stips": ["income_verification"], "auto_approve": false},
    "income_mismatch": {"manual_review": true}
  }', 'Rules for auto-generating stipulations based on application profile', 'stipulation_rules')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value, description, category) VALUES
  ('application_settings', '{
    "min_loan_amount": 5000,
    "max_loan_amount": 100000,
    "supported_states": ["CA", "TX", "FL", "NY", "IL", "PA", "OH", "GA", "NC", "MI"],
    "min_fico": 550,
    "max_dti": 50,
    "self_employment_rules_enabled": true
  }', 'Core application validation settings', 'application_settings')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value, description, category) VALUES
  ('lender_settings', '{
    "auto_match_enabled": true,
    "default_referral_fee": 500,
    "match_timeout_seconds": 30
  }', 'Lender matching configuration', 'lender_settings')
  ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value, description, category) VALUES
  ('platform_settings', '{
    "maintenance_mode": false,
    "registration_open": true,
    "show_apr_ranges_homepage": true,
    "notification_email": "admin@autoloanpro.co"
  }', 'Platform-wide settings', 'platform_settings')
  ON CONFLICT (key) DO NOTHING;
