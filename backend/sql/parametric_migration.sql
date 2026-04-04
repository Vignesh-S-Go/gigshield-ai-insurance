-- ============================================
-- GigShield Parametric Insurance Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add email column to workers table
ALTER TABLE workers ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add last_active_at column to workers table
ALTER TABLE workers ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- 3. Add fraud_score column to claims table
ALTER TABLE claims ADD COLUMN IF NOT EXISTS fraud_score INTEGER;

-- 4. Add trigger_value column to claims table
ALTER TABLE claims ADD COLUMN IF NOT EXISTS trigger_value DECIMAL(10, 2);

-- 5. Add severity column to claims table
ALTER TABLE claims ADD COLUMN IF NOT EXISTS severity TEXT;

-- 6. Create event_logs table for pipeline logging
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    city TEXT NOT NULL,
    step TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create trigger_logs table
CREATE TABLE IF NOT EXISTS trigger_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_type TEXT NOT NULL,
    city TEXT NOT NULL,
    value NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL,
    fired_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create notifications table for claim notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    claim_id TEXT REFERENCES claims(id),
    channel TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Migrate existing workers from users table to workers table
INSERT INTO workers (id, user_id, name, phone, city, plan, delivery_platform, status, last_active_at, email)
SELECT 
    'GS-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    id,
    name,
    phone,
    COALESCE(platform, 'Mumbai'),
    'Standard',
    COALESCE(platform, 'Zomato'),
    'active',
    NOW(),
    email
FROM users 
WHERE role = 'worker'
ON CONFLICT DO NOTHING;

-- 10. Update policies with city based on worker city
UPDATE policies p SET city = w.city
FROM workers w
WHERE p.worker_id = w.id AND p.city IS NULL;

-- 11. Verify migration
SELECT 'Workers migrated:' as info, COUNT(*) as count FROM workers;
SELECT 'Users count:' as info, COUNT(*) as count FROM users WHERE role = 'worker';
SELECT 'Policies count:' as info, COUNT(*) as count FROM policies;
