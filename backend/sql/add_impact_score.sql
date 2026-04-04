-- ZeroClaim v2 Migration
-- Add impact_score column to payout_logs

ALTER TABLE payout_logs
ADD COLUMN IF NOT EXISTS impact_score INTEGER NOT NULL DEFAULT 0;

-- Add type column to notification_logs for prevention alerts
ALTER TABLE notification_logs
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'notification';

ALTER TABLE notification_logs
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE notification_logs
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
