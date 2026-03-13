-- Documents table for consumer document uploads
CREATE SEQUENCE IF NOT EXISTS doc_seq START 1;

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT ('DOC-' || lpad(nextval('doc_seq')::TEXT, 5, '0')),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  application_id TEXT REFERENCES applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('drivers_license', 'proof_of_income', 'proof_of_insurance', 'proof_of_address')),
  file_name TEXT NOT NULL,
  file_size INT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON documents FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for documents (create this in Supabase Storage UI or via SQL)
-- Bucket name: documents
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, image/jpeg, image/png
