-- Migration: Add annual_value and date_added columns to resources table
-- Run this in Supabase SQL Editor

-- Add annual_value column (nullable integer for USD annual value)
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS annual_value integer CHECK (annual_value >= 0);

-- Add date_added column (date when resource was added)
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS date_added date;

-- Add hidden_gem column (boolean flag for featured "hidden gems")
ALTER TABLE resources
ADD COLUMN IF NOT EXISTS hidden_gem boolean DEFAULT false;

-- Create index for sorting by value
CREATE INDEX IF NOT EXISTS idx_resources_annual_value ON resources(annual_value DESC NULLS LAST);

-- Create index for sorting by date
CREATE INDEX IF NOT EXISTS idx_resources_date_added ON resources(date_added DESC);

-- Optionally, set date_added to added_at date for existing records
UPDATE resources
SET date_added = added_at::date
WHERE date_added IS NULL;
