-- ZeroClaim Demo Seed Data
-- Run this SQL in Supabase SQL Editor to populate demo data

-- ============================================
-- 1. CREATE WORKERS (if not exist)
-- ============================================

INSERT INTO workers (id, name, phone, city, platform, status, created_at, earnings_last_7_days, avg_daily_hours)
VALUES 
    ('w0010001-0000-0000-0000-000000000001', 'Ravi Kumar', '9876543210', 'Hyderabad', 'Swiggy', 'active', NOW() - INTERVAL '30 days', 8500, 9),
    ('w0010001-0000-0000-0000-000000000002', 'Priya Sharma', '9876543211', 'Mumbai', 'Zomato', 'active', NOW() - INTERVAL '45 days', 12000, 11),
    ('w0010001-0000-0000-0000-000000000003', 'Amit Singh', '9876543212', 'Delhi', 'Swiggy', 'active', NOW() - INTERVAL '20 days', 5500, 7)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE POLICIES
-- ============================================

INSERT INTO policies (id, worker_id, city, plan_type, status, max_payout, premium, coverage_type, created_at)
VALUES 
    ('p0010001-0000-0000-0000-000000000001', 'w0010001-0000-0000-0000-000000000001', 'Hyderabad', 'Pro', 'Active', 5000, 71, 'parametric', NOW() - INTERVAL '25 days'),
    ('p0010001-0000-0000-0000-000000000002', 'w0010001-0000-0000-0000-000000000002', 'Mumbai', 'Pro Plus', 'Active', 7500, 95, 'parametric', NOW() - INTERVAL '40 days'),
    ('p0010001-0000-0000-0000-000000000003', 'w0010001-0000-0000-0000-000000000003', 'Delhi', 'Basic', 'Active', 3000, 45, 'parametric', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. CREATE TRIGGER LOGS
-- ============================================

INSERT INTO trigger_logs (id, trigger_type, city, value, threshold, severity, fired_at, processing_ms)
VALUES 
    ('t0010001-0000-0000-0000-000000000001', 'HEAVY_RAIN', 'Hyderabad', 82, 75, 'medium', NOW() - INTERVAL '2 hours', 1250),
    ('t0010001-0000-0000-0000-000000000002', 'AQI_HIGH', 'Delhi', 185, 150, 'medium', NOW() - INTERVAL '4 hours', 980),
    ('t0010001-0000-0000-0000-000000000003', 'HEAT_WAVE', 'Mumbai', 43, 42, 'severe', NOW() - INTERVAL '6 hours', 1450),
    ('t0010001-0000-0000-0000-000000000004', 'HEAVY_RAIN', 'Mumbai', 78, 75, 'medium', NOW() - INTERVAL '8 hours', 1100),
    ('t0010001-0000-0000-0000-000000000005', 'FLOOD_ALERT', 'Hyderabad', 4, 3, 'severe', NOW() - INTERVAL '12 hours', 1680)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. CREATE PAYOUT LOGS
-- ============================================

INSERT INTO payout_logs (id, user_id, policy_id, trigger_id, amount, coverage_amount, severity, fraud_score, fraud_flags, reason, impact_score, paid_at)
VALUES 
    ('pay0010001-0000-0000-0000-000000000001', 'w0010001-0000-0000-0000-000000000001', 'p0010001-0000-0000-0000-000000000001', 't0010001-0000-0000-0000-000000000001', 1230, 5000, 'medium', 35, '[]', 'Medium severity. High worker dependency.', 82, NOW() - INTERVAL '1 hour 55 minutes'),
    ('pay0010001-0000-0000-0000-000000000002', 'w0010001-0000-0000-0000-000000000002', 'p0010001-0000-0000-0000-000000000002', 't0010001-0000-0000-0000-000000000002', 2250, 7500, 'medium', 28, '[]', 'Medium severity. High worker dependency.', 90, NOW() - INTERVAL '3 hours 50 minutes'),
    ('pay0010001-0000-0000-0000-000000000003', 'w0010001-0000-0000-0000-000000000002', 'p0010001-0000-0000-0000-000000000002', 't0010001-0000-0000-0000-000000000003', 3750, 7500, 'severe', 42, '[]', 'Severe heat wave. Maximum payout triggered.', 88, NOW() - INTERVAL '5 hours 45 minutes'),
    ('pay0010001-0000-0000-0000-000000000004', 'w0010001-0000-0000-0000-000000000001', 'p0010001-0000-0000-0000-000000000001', 't0010001-0000-0000-0000-000000000004', 1500, 5000, 'medium', 55, '[]', 'Medium rain. Standard payout.', 65, NOW() - INTERVAL '7 hours 30 minutes'),
    ('pay0010001-0000-0000-0000-000000000005', 'w0010001-0000-0000-0000-000000000003', 'p0010001-0000-0000-0000-000000000003', 't0010001-0000-0000-0000-000000000002', 900, 3000, 'medium', 38, '[]', 'Medium severity. Moderate dependency.', 58, NOW() - INTERVAL '3 hours 55 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. CREATE EVENT LOGS
-- ============================================

INSERT INTO event_logs (id, trigger_id, stage, status, metadata, created_at)
VALUES 
    (gen_random_uuid(), 't0010001-0000-0000-0000-000000000001', 'TRIGGER', 'success', '{"type": "HEAVY_RAIN", "severity": "medium", "value": 82, "city": "Hyderabad"}', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 't0010001-0000-0000-0000-000000000001', 'POLICY_MATCH', 'success', '{"matched": 1}', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 't0010001-0000-0000-0000-000000000001', 'FRAUD_CHECK', 'success', '{"score": 35, "eligible": true}', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 't0010001-0000-0000-0000-000000000001', 'PAYOUT', 'success', '{"amount": 1230}', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 't0010001-0000-0000-0000-000000000001', 'PAYMENT', 'success', '{"simulated": true}', NOW() - INTERVAL '2 hours'),
    (gen_random_uuid(), 't0010001-0000-0000-0000-000000000001', 'NOTIFICATION', 'success', '{"channels": ["SMS"]}', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. CREATE NOTIFICATION LOGS
-- ============================================

INSERT INTO notification_logs (id, user_id, channel, message, type, created_at)
VALUES 
    (gen_random_uuid(), 'w0010001-0000-0000-0000-000000000001', 'SMS', 'ZeroClaim: ₹1230 payout triggered due to Heavy Rain (Medium).', 'payout', NOW() - INTERVAL '1 hour 55 minutes'),
    (gen_random_uuid(), 'w0010001-0000-0000-0000-000000000002', 'SMS', 'ZeroClaim: ₹2250 payout triggered due to AQI High (Medium).', 'payout', NOW() - INTERVAL '3 hours 50 minutes'),
    (gen_random_uuid(), 'w0010001-0000-0000-0000-000000000002', 'SMS', 'ZeroClaim: ₹3750 payout triggered due to Heat Wave (Severe).', 'payout', NOW() - INTERVAL '5 hours 45 minutes'),
    (gen_random_uuid(), 'w0010001-0000-0000-0000-000000000001', 'IN_APP', 'AQI rising in your area. Consider reducing work hours.', 'prevention_alert', NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. VERIFY DATA
-- ============================================

SELECT 'Workers created:' as info, COUNT(*) as count FROM workers WHERE id IN ('w0010001-0000-0000-0000-000000001', 'w0010001-0000-0000-0000-000000002', 'w0010001-0000-0000-0000-000000003');
SELECT 'Policies created:' as info, COUNT(*) as count FROM policies;
SELECT 'Triggers created:' as info, COUNT(*) as count FROM trigger_logs;
SELECT 'Payouts created:' as info, COUNT(*) as count FROM payout_logs;

-- ============================================
-- 8. TEST QUERIES
-- ============================================

-- View recent payouts with worker names
SELECT 
    pl.id,
    pl.amount,
    pl.severity,
    pl.impact_score,
    pl.fraud_score,
    w.name as worker_name,
    w.city,
    tl.trigger_type
FROM payout_logs pl
LEFT JOIN workers w ON pl.user_id = w.id
LEFT JOIN trigger_logs tl ON pl.trigger_id = tl.id
ORDER BY pl.paid_at DESC
LIMIT 5;

-- View triggers
SELECT * FROM trigger_logs ORDER BY fired_at DESC LIMIT 5;