-- Migration: Add resource_reports table for user-submitted issue reports
-- Run this in Supabase SQL Editor

-- Create resource_reports table
CREATE TABLE IF NOT EXISTS resource_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  issue_type text NOT NULL CHECK (issue_type IN ('broken-link', 'wrong-info', 'outdated', 'eligibility', 'other')),
  details text,
  email text, -- Optional email if user wants a sticker
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'fixed'))
);

-- Create index for querying reports by resource
CREATE INDEX IF NOT EXISTS idx_reports_resource_id ON resource_reports(resource_id);

-- Create index for querying pending reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON resource_reports(status);

-- Enable RLS
ALTER TABLE resource_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit reports (insert only)
CREATE POLICY "Anyone can submit reports"
  ON resource_reports
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow reading all reports (for admin purposes, can be restricted later)
CREATE POLICY "Anyone can view reports"
  ON resource_reports
  FOR SELECT
  TO anon, authenticated
  USING (true);
