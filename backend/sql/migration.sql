-- Add to users table if missing:
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Claims table:
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  policy_id UUID REFERENCES policies(id),
  trigger_type TEXT NOT NULL,
  trigger_value NUMERIC NOT NULL,
  payout_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'processed',
  rejection_reason TEXT,
  ai_explanation TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger audit log:
CREATE TABLE IF NOT EXISTS trigger_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL,
  city TEXT NOT NULL,
  value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  fired_at TIMESTAMPTZ DEFAULT now()
);
