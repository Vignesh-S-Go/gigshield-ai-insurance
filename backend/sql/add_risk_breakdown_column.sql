-- Run this in Supabase SQL Editor to add risk_breakdown column
ALTER TABLE workers ADD COLUMN IF NOT EXISTS risk_breakdown JSONB DEFAULT '{}';
