-- Run this in Supabase SQL Editor to add earnings_history column
ALTER TABLE workers ADD COLUMN IF NOT EXISTS earnings_history JSONB DEFAULT '[]';
