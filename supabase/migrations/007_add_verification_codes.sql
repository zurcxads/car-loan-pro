CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'phone')),
  recipient TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  created_by UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_lookup
  ON verification_codes(channel, recipient, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at
  ON verification_codes(expires_at);

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage verification codes"
  ON verification_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE verification_codes IS 'Stores hashed email and phone verification codes';
