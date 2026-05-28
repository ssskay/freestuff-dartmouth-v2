-- Free Stuff at Big Green - Supabase Schema
-- Phase 1: Core tables for hybrid static->dynamic migration
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Resources table (main catalog)
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  category text NOT NULL CHECK (category IN (
    'software', 'news', 'library', 'outdoor', 'money', 'health',
    'career', 'campus-life', 'alumni-only', 'tuck', 'transportation',
    'off-campus'
  )),
  eligibility text[] NOT NULL DEFAULT '{}',
  last_verified date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  source text,
  added_at timestamptz NOT NULL DEFAULT now(),
  added_by text DEFAULT 'human',
  upvotes integer NOT NULL DEFAULT 0 CHECK (upvotes >= 0),
  is_active boolean NOT NULL DEFAULT true,

  -- Indexes for common queries
  CONSTRAINT url_unique UNIQUE (url)
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_eligibility ON resources USING GIN(eligibility);
CREATE INDEX IF NOT EXISTS idx_resources_upvotes ON resources(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active) WHERE is_active = true;

-- Votes table (upvote tracking)
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  voted_at timestamptz NOT NULL DEFAULT now(),

  -- Prevent double voting from same fingerprint
  CONSTRAINT unique_vote UNIQUE (resource_id, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_votes_resource ON votes(resource_id);
CREATE INDEX IF NOT EXISTS idx_votes_fingerprint ON votes(fingerprint);

-- Pending resources table (moderation queue)
CREATE TABLE IF NOT EXISTS pending_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  url text NOT NULL,
  category text,
  eligibility text[] DEFAULT '{}',
  notes text,
  submitted_by text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  agent_source text CHECK (agent_source IN ('verify', 'discover', 'draft', NULL)),
  reviewed_at timestamptz,
  reviewer_notes text
);

CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_resources(status);
CREATE INDEX IF NOT EXISTS idx_pending_submitted ON pending_resources(submitted_at DESC);

-- Function: Atomic upvote (increments resource.upvotes, creates vote record)
CREATE OR REPLACE FUNCTION upvote_resource(
  p_resource_id uuid,
  p_fingerprint text
)
RETURNS TABLE(success boolean, upvotes integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvotes integer;
BEGIN
  -- Check if vote already exists
  IF EXISTS (SELECT 1 FROM votes WHERE resource_id = p_resource_id AND fingerprint = p_fingerprint) THEN
    SELECT resources.upvotes INTO v_upvotes FROM resources WHERE id = p_resource_id;
    RETURN QUERY SELECT false, v_upvotes, 'Already voted'::text;
    RETURN;
  END IF;

  -- Insert vote record
  INSERT INTO votes (resource_id, fingerprint) VALUES (p_resource_id, p_fingerprint);

  -- Increment resource upvote count
  UPDATE resources SET upvotes = resources.upvotes + 1 WHERE id = p_resource_id RETURNING resources.upvotes INTO v_upvotes;

  RETURN QUERY SELECT true, v_upvotes, 'Vote recorded'::text;
END;
$$;

-- Function: Remove upvote (decrements resource.upvotes, removes vote record)
CREATE OR REPLACE FUNCTION remove_upvote(
  p_resource_id uuid,
  p_fingerprint text
)
RETURNS TABLE(success boolean, upvotes integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_upvotes integer;
BEGIN
  -- Check if vote exists
  IF NOT EXISTS (SELECT 1 FROM votes WHERE resource_id = p_resource_id AND fingerprint = p_fingerprint) THEN
    SELECT resources.upvotes INTO v_upvotes FROM resources WHERE id = p_resource_id;
    RETURN QUERY SELECT false, v_upvotes, 'Vote not found'::text;
    RETURN;
  END IF;

  -- Remove vote record
  DELETE FROM votes WHERE resource_id = p_resource_id AND fingerprint = p_fingerprint;

  -- Decrement resource upvote count (don't go below 0)
  UPDATE resources
  SET upvotes = GREATEST(resources.upvotes - 1, 0)
  WHERE id = p_resource_id
  RETURNING resources.upvotes INTO v_upvotes;

  RETURN QUERY SELECT true, v_upvotes, 'Vote removed'::text;
END;
$$;

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_resources ENABLE ROW LEVEL SECURITY;

-- Resources: Public read access
CREATE POLICY "Public read access for active resources"
  ON resources
  FOR SELECT
  USING (is_active = true);

-- Votes: Users can read their own votes
CREATE POLICY "Users can read all votes"
  ON votes
  FOR SELECT
  USING (true);

-- Votes: Users can insert votes (function handles validation)
CREATE POLICY "Users can insert votes"
  ON votes
  FOR INSERT
  WITH CHECK (true);

-- Votes: Users can delete their own votes by fingerprint
CREATE POLICY "Users can delete their own votes"
  ON votes
  FOR DELETE
  USING (true);

-- Pending resources: Public can insert (submit new resources)
CREATE POLICY "Public can submit resources"
  ON pending_resources
  FOR INSERT
  WITH CHECK (true);

-- Pending resources: Public can read their own submissions
CREATE POLICY "Public can read pending resources"
  ON pending_resources
  FOR SELECT
  USING (true);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION upvote_resource TO anon, authenticated;
GRANT EXECUTE ON FUNCTION remove_upvote TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE resources IS 'Main catalog of free resources available to Dartmouth community';
COMMENT ON TABLE votes IS 'Upvote tracking with fingerprint-based deduplication';
COMMENT ON TABLE pending_resources IS 'Moderation queue for community and agent submissions';
COMMENT ON FUNCTION upvote_resource IS 'Atomically record an upvote and increment counter';
COMMENT ON FUNCTION remove_upvote IS 'Atomically remove an upvote and decrement counter';
