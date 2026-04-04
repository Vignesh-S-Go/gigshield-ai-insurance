-- ============================================
-- GigShield Parametric Insurance Extension
-- Migration: Add columns to existing tables
-- ============================================

-- Add severity and processing_ms columns to trigger_logs if not exists
ALTER TABLE trigger_logs ADD COLUMN IF NOT EXISTS severity TEXT;
ALTER TABLE trigger_logs ADD COLUMN IF NOT EXISTS processing_ms INTEGER;

-- Add new columns to existing event_logs table (if not exists)
ALTER TABLE event_logs ADD COLUMN IF NOT EXISTS trigger_id TEXT;
ALTER TABLE event_logs ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE event_logs ADD COLUMN IF NOT EXISTS status TEXT;

-- Create payout_logs table
CREATE TABLE IF NOT EXISTS payout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    policy_id TEXT,
    trigger_id TEXT,
    amount NUMERIC NOT NULL,
    coverage_amount NUMERIC NOT NULL,
    severity TEXT NOT NULL,
    fraud_score INTEGER NOT NULL,
    fraud_flags JSONB DEFAULT '[]',
    reason TEXT,
    paid_at TIMESTAMPTZ DEFAULT now()
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    channel TEXT NOT NULL CHECK (channel IN ('SMS', 'PUSH')),
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- Add fraud_score and fraud_flags to claims if not exists
ALTER TABLE claims ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS fraud_flags JSONB DEFAULT '[]';

-- Add earnings_last_7_days column to workers if not exists
ALTER TABLE workers ADD COLUMN IF NOT EXISTS earnings_last_7_days NUMERIC DEFAULT 0;
ALTER TABLE payout_logs ADD COLUMN IF NOT EXISTS ai_decision TEXT DEFAULT 'AUTO-APPROVED';
ALTER TABLE payout_logs ADD COLUMN IF NOT EXISTS impact_score INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_event_logs_trigger_id ON event_logs(trigger_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_stage ON event_logs(stage);
CREATE INDEX IF NOT EXISTS idx_payout_logs_user_id ON payout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_logs_trigger_id ON payout_logs(trigger_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);

-- Seed data for demo
-- Insert demo users if not already present
INSERT INTO users (id, name, email, phone, created_at)
VALUES
    ('11111111-0000-0000-0000-000000000001', 'Ravi Kumar', 'ravi@demo.com', '+91 9000000001', NOW() - INTERVAL '30 days'),
    ('11111111-0000-0000-0000-000000000002', 'Priya Nair', 'priya@demo.com', '+91 9000000002', NOW() - INTERVAL '60 days'),
    ('11111111-0000-0000-0000-000000000003', 'Arjun Das', 'arjun@demo.com', '+91 9000000003', NOW() - INTERVAL '90 days')
ON CONFLICT DO NOTHING;

-- Link demo users to workers (update existing workers or create new)
UPDATE workers SET user_id = '11111111-0000-0000-0000-000000000001' WHERE id = 'GS-A1B2C3D1';
UPDATE workers SET user_id = '11111111-0000-0000-0000-000000000002' WHERE id = 'GS-A1B2C3D2';
UPDATE workers SET user_id = '11111111-0000-0000-0000-000000000003' WHERE id = 'GS-A1B2C3D3';

-- Insert active policies for demo users (using worker_id)
INSERT INTO policies (worker_id, plan_type, premium, max_payout, status, renewal_date, city)
VALUES
    ('GS-A1B2C3D1', 'Pro', 79.00, 5000, 'Active', NOW() + INTERVAL '30 days', 'Mumbai'),
    ('GS-A1B2C3D2', 'Standard', 49.00, 8000, 'Active', NOW() + INTERVAL '15 days', 'Delhi'),
    ('GS-A1B2C3D3', 'Basic', 25.00, 6000, 'Active', NOW() + INTERVAL '45 days', 'Bangalore')
ON CONFLICT DO NOTHING;
