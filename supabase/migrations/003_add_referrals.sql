-- Add referral_code to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES users(referral_code);

-- Generate random referral codes for existing users
UPDATE users
SET referral_code = 'REF-' || upper(substring(md5(random()::text) from 1 for 8))
WHERE referral_code IS NULL;

-- Referrals table for tracking
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id UUID REFERENCES users(id),
  referrer_code TEXT NOT NULL,
  referee_user_id UUID REFERENCES users(id),
  referee_email TEXT NOT NULL,
  application_id TEXT REFERENCES applications(id),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'applied', 'funded')),
  reward_amount NUMERIC DEFAULT 50,
  reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  funded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_user_id);

-- Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON referrals FOR ALL USING (true) WITH CHECK (true);

COMMENT ON COLUMN users.referral_code IS 'Unique referral code for this user';
COMMENT ON COLUMN users.referred_by IS 'Referral code of user who referred this user';
COMMENT ON TABLE referrals IS 'Tracks referral relationships and rewards';
