-- ============================================
-- GigShield Database Schema for Supabase
-- ============================================

SET TIME ZONE 'Asia/Kolkata';

DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'worker' CHECK (role IN ('worker', 'admin')),
    platform TEXT DEFAULT 'Zomato',
    is_verified BOOLEAN DEFAULT false,
    is_working BOOLEAN DEFAULT false,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    today_earnings DECIMAL(10, 2) DEFAULT 0,
    weekly_earnings DECIMAL(10, 2) DEFAULT 0,
    deliveries INTEGER DEFAULT 0,
    rating DECIMAL(3, 1) DEFAULT 4.5,
    risk_score DECIMAL(4, 2) DEFAULT 0.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(phone)
);

CREATE TABLE workers (
    id TEXT PRIMARY KEY DEFAULT ('GS-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    plan TEXT DEFAULT 'Standard' CHECK (plan IN ('Basic', 'Standard', 'Pro')),
    weekly_earnings DECIMAL(10, 2) DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    risk_score DECIMAL(4, 2) DEFAULT 0.50,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    delivery_platform TEXT DEFAULT 'Zomato' CHECK (delivery_platform IN ('Zomato', 'Swiggy')),
    total_deliveries INTEGER DEFAULT 0,
    avg_rating DECIMAL(3, 1) DEFAULT 4.0,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    earnings_history JSONB DEFAULT '[]',
    risk_breakdown JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE policies (
    id TEXT PRIMARY KEY DEFAULT ('PL-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
    worker_id TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('Basic', 'Standard', 'Pro')),
    premium DECIMAL(10, 2) NOT NULL,
    max_payout DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Cancelled')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    renewal_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE claims (
    id TEXT PRIMARY KEY DEFAULT ('CL-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
    worker_id TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('Rain', 'Heat', 'Flood', 'AQI', 'Curfew', 'Emergency')),
    claim_type TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Paid', 'Flagged')),
    payout_amount DECIMAL(10, 2) DEFAULT 0,
    payout DECIMAL(10, 2) DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trigger_data JSONB DEFAULT '{}',
    validation_status TEXT DEFAULT 'Passed' CHECK (validation_status IN ('Passed', 'Failed')),
    gps_verified BOOLEAN DEFAULT true,
    processing_time TEXT,
    weather_source TEXT,
    blockchain_tx TEXT,
    ai_meta JSONB DEFAULT '{}',
    audit_trail JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    zone_name TEXT NOT NULL,
    city TEXT NOT NULL,
    risk_score DECIMAL(4, 2) DEFAULT 0.50,
    active_policies INTEGER DEFAULT 0,
    recent_claims INTEGER DEFAULT 0,
    primary_threat TEXT CHECK (primary_threat IN ('Rain', 'Heat', 'Flood', 'AQI', 'Curfew')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(zone_name, city)
);

CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'danger')),
    icon TEXT,
    read BOOLEAN DEFAULT false,
    time_ago TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    worker_id TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    calculated_amount DECIMAL(10, 2),
    risk_score INTEGER DEFAULT 50,
    fraud_risk_level TEXT DEFAULT 'low' CHECK (fraud_risk_level IN ('low', 'medium', 'high')),
    fraud_score INTEGER DEFAULT 0,
    approval_status TEXT DEFAULT 'auto_approved' CHECK (approval_status IN ('auto_approved', 'manual_review', 'rejected')),
    ai_decision JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    blockchain_tx TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fraud_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
    claim_id TEXT REFERENCES claims(id) ON DELETE CASCADE,
    fraud_type TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    details JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workers_phone ON workers(phone);
CREATE INDEX idx_workers_city ON workers(city);
CREATE INDEX idx_workers_status ON workers(status);
CREATE INDEX idx_policies_worker_id ON policies(worker_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_claims_worker_id ON claims(worker_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_trigger_type ON claims(trigger_type);
CREATE INDEX idx_claims_date ON claims(date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_payouts_worker_id ON payouts(worker_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_fraud_risk ON payouts(fraud_risk_level);
CREATE INDEX idx_payouts_claim_id ON payouts(claim_id);
CREATE INDEX idx_fraud_history_worker_id ON fraud_history(worker_id);
CREATE INDEX idx_fraud_history_severity ON fraud_history(severity);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE zones DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE payouts DISABLE ROW LEVEL SECURITY;

INSERT INTO workers (id, name, phone, city, plan, weekly_earnings, total_earnings, risk_score, status, delivery_platform, total_deliveries, avg_rating) VALUES
('GS-A1B2C3D1', 'Rajesh Kumar', '+91 9876543210', 'Mumbai', 'Pro', 5500, 180000, 0.65, 'active', 'Zomato', 2450, 4.5),
('GS-A1B2C3D2', 'Priya Sharma', '+91 9876543211', 'Delhi', 'Standard', 4800, 145000, 0.72, 'active', 'Swiggy', 1890, 4.3),
('GS-A1B2C3D3', 'Amit Singh', '+91 9876543212', 'Bangalore', 'Basic', 4200, 98000, 0.45, 'active', 'Zomato', 3200, 4.7),
('GS-A1B2C3D4', 'Neha Patel', '+91 9876543213', 'Hyderabad', 'Standard', 5100, 165000, 0.58, 'active', 'Swiggy', 2100, 4.4),
('GS-A1B2C3D5', 'Vikram Reddy', '+91 9876543214', 'Chennai', 'Pro', 5800, 210000, 0.81, 'active', 'Zomato', 1650, 4.2);

INSERT INTO policies (worker_id, plan_type, premium, max_payout, status, renewal_date) VALUES
('GS-A1B2C3D1', 'Pro', 79.00, 2000, 'Active', NOW() + INTERVAL '30 days'),
('GS-A1B2C3D2', 'Standard', 49.00, 1200, 'Active', NOW() + INTERVAL '15 days'),
('GS-A1B2C3D3', 'Basic', 25.00, 500, 'Active', NOW() + INTERVAL '45 days'),
('GS-A1B2C3D4', 'Standard', 49.00, 1200, 'Active', NOW() + INTERVAL '20 days'),
('GS-A1B2C3D5', 'Pro', 79.00, 2000, 'Active', NOW() + INTERVAL '10 days');

INSERT INTO claims (worker_id, trigger_type, claim_type, status, payout_amount, payout, trigger_data, validation_status, gps_verified, weather_source) VALUES
('GS-A1B2C3D1', 'Rain', 'Rain', 'Paid', 1200, 1200, '{"rainfall": "45mm/hr"}', 'Passed', true, 'IMD'),
('GS-A1B2C3D2', 'Heat', 'Heat', 'Approved', 800, 800, '{"temperature": "44 C"}', 'Passed', true, 'OpenWeather'),
('GS-A1B2C3D4', 'Flood', 'Flood', 'Flagged', 0, 0, '{"floodLevel": "3ft"}', 'Failed', false, 'AccuWeather'),
('GS-A1B2C3D5', 'AQI', 'AQI', 'Paid', 600, 600, '{"aqi": 420}', 'Passed', true, 'CPCB');

INSERT INTO zones (zone_name, city, risk_score, active_policies, recent_claims, primary_threat, latitude, longitude) VALUES
('Andheri West', 'Mumbai', 0.92, 150, 28, 'Flood', 19.1368, 72.8293),
('Rohini', 'Delhi', 0.85, 120, 22, 'AQI', 28.7495, 77.0566),
('T. Nagar', 'Chennai', 0.81, 95, 18, 'Rain', 13.0418, 80.2341),
('Koramangala', 'Bangalore', 0.73, 110, 15, 'Flood', 12.9352, 77.6245),
('Gachibowli', 'Hyderabad', 0.62, 85, 12, 'Heat', 17.4401, 78.3489);

INSERT INTO fraud_history (worker_id, fraud_type, severity, details, resolved) VALUES
('GS-A1B2C3D4', 'GPS_SPOOFING', 'high', '{"check": "location_mismatch", "threshold": "2km"}', false);

INSERT INTO notifications (title, message, type, icon, time_ago) VALUES
('Claim Rejected', 'Rejected due to Pandemic Exclusion (Clause 4.2).', 'danger', 'alert', '2 min ago'),
('AI Risk Alert', 'Heavy rain detected in Mumbai and risk increased by 20 percent.', 'warning', 'rain', '15 min ago'),
('Premium Update', 'Worker GS-A1B2C3D1 premium increased due to high risk.', 'info', 'premium', '1 hr ago'),
('Fraud Alert', 'Suspicious claim activity from Worker GS-A1B2C3D4.', 'danger', 'shield', '2 hrs ago');
