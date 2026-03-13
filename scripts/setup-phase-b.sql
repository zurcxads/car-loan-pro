-- Auto Loan Pro — Phase B Database Schema
-- Run this in your Supabase SQL editor to set up all tables

-- ============================================
-- APPLICATION EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'submitted', 'lender_matched', 'offer_received', 'offer_selected', 'documents_requested', 'document_uploaded', 'document_approved', 'document_rejected', 'approved', 'funded'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_events_app_id ON application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_created_at ON application_events(created_at DESC);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'paystub', 'bank_statement', 'proof_of_residence', 'tax_return', 'drivers_license', 'other'
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_documents_app_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Can be application_id for consumers, or admin/lender user_id
  application_id TEXT,
  type TEXT NOT NULL, -- 'application_submitted', 'offers_ready', 'offer_selected', 'document_requested', 'document_approved', 'document_rejected', 'approval_complete', 'rate_expiring'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb, -- Extra metadata (offer_id, document_id, etc)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- ERROR LOGS TABLE (for Phase D6)
-- ============================================
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  user_agent TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

-- ============================================
-- SUPABASE STORAGE BUCKET
-- ============================================
-- Create 'documents' bucket for file uploads
-- Run this separately or ensure Storage is enabled
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow authenticated users to upload to their own application folder
CREATE POLICY "Users can upload to their application folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy: Allow users to read their own documents
CREATE POLICY "Users can read their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policy: Allow admins to read all documents
CREATE POLICY "Admins can read all documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create an application event
CREATE OR REPLACE FUNCTION create_application_event(
  p_application_id TEXT,
  p_event_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO application_events (application_id, event_type, description, metadata)
  VALUES (p_application_id, p_event_type, p_description, p_metadata)
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_application_id TEXT DEFAULT NULL,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, application_id, type, title, message, data)
  VALUES (p_user_id, p_application_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Automatically create event when application is created
CREATE OR REPLACE FUNCTION on_application_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_application_event(
    NEW.id,
    'submitted',
    'Application submitted',
    jsonb_build_object('status', NEW.status)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_application_created
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION on_application_created();

-- Automatically create event when offer is selected
CREATE OR REPLACE FUNCTION on_offer_selected()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'selected' AND (OLD.status IS NULL OR OLD.status != 'selected') THEN
    PERFORM create_application_event(
      NEW.application_id,
      'offer_selected',
      'Offer selected: ' || NEW.lender_name,
      jsonb_build_object('offer_id', NEW.id, 'lender_name', NEW.lender_name, 'apr', NEW.apr)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_offer_selected
AFTER UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION on_offer_selected();

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
-- Uncomment below to insert sample notification

-- INSERT INTO notifications (user_id, type, title, message, application_id)
-- VALUES (
--   'APP-001',
--   'application_submitted',
--   'Application Received',
--   'Your auto loan application has been received and is being reviewed.',
--   'APP-001'
-- );
