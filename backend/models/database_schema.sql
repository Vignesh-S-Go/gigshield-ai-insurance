-- User Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    risk_score DECIMAL(3,2) DEFAULT 0.50
);

-- Policies Table
CREATE TABLE policies (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    coverage VARCHAR(50),      -- e.g. "Comprehensive", "Parametric Weather"
    sum_insured DECIMAL(10,2),
    deductible DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Claims Table
CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    policy_id INT REFERENCES policies(id),
    event_type VARCHAR(50),    -- e.g. "Accident", "Pandemic", "Flood"
    status VARCHAR(20),        -- 'APPROVED', 'REJECTED', 'FLAGGED'
    reason TEXT,               -- Decision reasoning
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Transactions Ledger
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    amount DECIMAL(10,2),
    type VARCHAR(20),          -- 'PREMIUM_IN', 'PAYOUT_OUT'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
