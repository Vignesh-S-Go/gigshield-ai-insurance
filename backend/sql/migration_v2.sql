-- Event log for every pipeline step:
CREATE TABLE IF NOT EXISTS event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  city TEXT NOT NULL,
  step TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications log:
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  claim_id TEXT REFERENCES claims(id),
  channel TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Add last_active_at column to workers table:
ALTER TABLE workers ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Add fraud_score column to claims (using existing schema structure):
ALTER TABLE claims ADD COLUMN IF NOT EXISTS fraud_score INTEGER;

-- Add trigger_value and severity to claims:
ALTER TABLE claims ADD COLUMN IF NOT EXISTS trigger_value DECIMAL(10, 2);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS severity TEXT;
