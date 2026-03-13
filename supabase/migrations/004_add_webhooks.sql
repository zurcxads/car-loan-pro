-- Webhooks table for lender webhook configuration
CREATE SEQUENCE IF NOT EXISTS webhook_seq START 1;

CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY DEFAULT ('WH-' || lpad(nextval('webhook_seq')::TEXT, 5, '0')),
  lender_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook deliveries log
CREATE SEQUENCE IF NOT EXISTS webhook_delivery_seq START 1;

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id TEXT PRIMARY KEY DEFAULT ('WHD-' || lpad(nextval('webhook_delivery_seq')::TEXT, 6, '0')),
  webhook_id TEXT REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_lender_id ON webhooks(lender_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);

-- Row Level Security
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON webhooks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON webhook_deliveries FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE webhooks IS 'Lender webhook configurations';
COMMENT ON TABLE webhook_deliveries IS 'Log of webhook delivery attempts';
