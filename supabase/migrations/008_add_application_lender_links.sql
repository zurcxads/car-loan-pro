CREATE TABLE IF NOT EXISTS application_lender_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  lender_id TEXT NOT NULL REFERENCES lenders(id),
  offer_id TEXT NOT NULL REFERENCES offers(id),
  consumer_email TEXT NOT NULL,
  selected_term_months INT,
  selected_down_payment NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_application_lender_links_lender_id
  ON application_lender_links(lender_id);

CREATE INDEX IF NOT EXISTS idx_application_lender_links_consumer_email
  ON application_lender_links(consumer_email);

ALTER TABLE application_lender_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON application_lender_links
  FOR ALL USING (true) WITH CHECK (true);
