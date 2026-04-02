ALTER TABLE claims ADD COLUMN IF NOT EXISTS claim_type TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS payout DECIMAL(10, 2) DEFAULT 0;

UPDATE claims
SET
    claim_type = COALESCE(claim_type, trigger_type),
    payout = COALESCE(payout, payout_amount, 0);
