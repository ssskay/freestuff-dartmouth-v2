-- Fix ambiguous column references in upvote functions
-- Run this in Supabase SQL Editor to fix the upvote functionality

-- Drop existing functions first
DROP FUNCTION IF EXISTS upvote_resource(uuid, text);
DROP FUNCTION IF EXISTS remove_upvote(uuid, text);

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

  -- Increment resource upvote count (fixed: qualified column name)
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

  -- Decrement resource upvote count (fixed: qualified column name, don't go below 0)
  UPDATE resources
  SET upvotes = GREATEST(resources.upvotes - 1, 0)
  WHERE id = p_resource_id
  RETURNING resources.upvotes INTO v_upvotes;

  RETURN QUERY SELECT true, v_upvotes, 'Vote removed'::text;
END;
$$;
