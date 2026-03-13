-- Create magic_links table for passwordless authentication
CREATE TABLE IF NOT EXISTS magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  application_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster token lookups
CREATE INDEX idx_magic_links_token ON magic_links(token);

-- Create index for email lookups
CREATE INDEX idx_magic_links_email ON magic_links(email);

-- Create index for cleanup of expired tokens
CREATE INDEX idx_magic_links_expires_at ON magic_links(expires_at);

-- Add RLS policies
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role can manage magic links"
  ON magic_links
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE magic_links IS 'Stores magic link tokens for passwordless authentication';
