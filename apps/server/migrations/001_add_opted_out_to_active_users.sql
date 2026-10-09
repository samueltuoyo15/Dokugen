-- Migration 001: Add opted_out column to active_users
-- Allows users to opt out of public leaderboard while keeping usage metrics tracked

ALTER TABLE active_users 
ADD COLUMN IF NOT EXISTS opted_out BOOLEAN DEFAULT FALSE;

UPDATE active_users SET opted_out = FALSE WHERE opted_out IS NULL;

ALTER TABLE active_users
ALTER COLUMN opted_out SET DEFAULT FALSE,
ALTER COLUMN opted_out SET NOT NULL;

-- Index for leaderboard queries filtering out opted_out users
CREATE INDEX IF NOT EXISTS idx_active_users_opted_out ON active_users (opted_out);
