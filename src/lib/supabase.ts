/**
 * Supabase Client for Free Stuff at Big Green
 * Typed helpers for database operations
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables (set these in .env)
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// For Node.js environments (build time), import ws for WebSocket support
let WebSocket: any;
if (typeof window === 'undefined') {
  try {
    WebSocket = (await import('ws')).default;
  } catch (e) {
    // ws not available, but that's okay
    console.warn('ws package not available for WebSocket support');
  }
}

// Create Supabase client (with fallback for build time)
// If env vars are missing, client will be created but operations will fail gracefully
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // Disable session persistence for server-side
    },
    realtime: WebSocket ? {
      transport: WebSocket
    } : undefined
  }
);

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Type definitions for our domain models
export interface Resource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  eligibility: string[];
  last_verified: string;
  notes: string | null;
  source: string | null;
  added_at: string;
  added_by: string;
  upvotes: number;
  is_active: boolean;
}

export interface Vote {
  id: string;
  resource_id: string;
  fingerprint: string;
  voted_at: string;
}

export interface PendingResource {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string | null;
  eligibility: string[];
  notes: string | null;
  submitted_by: string | null;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  agent_source: 'verify' | 'discover' | 'draft' | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

// Helper functions

/**
 * Fetch all active resources with upvote counts
 */
export async function getAllResources(): Promise<Resource[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty array');
    return [];
  }

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single resource by ID
 */
export async function getResourceById(id: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching resource:', error);
    return null;
  }

  return data;
}

/**
 * Check if a user has already voted for a resource
 */
export async function hasUserVoted(
  resourceId: string,
  fingerprint: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('resource_id', resourceId)
    .eq('fingerprint', fingerprint)
    .maybeSingle();

  if (error) {
    console.error('Error checking vote:', error);
    return false;
  }

  return data !== null;
}

/**
 * Upvote a resource (calls database function for atomic operation)
 */
export async function upvoteResource(
  resourceId: string,
  fingerprint: string
): Promise<{ success: boolean; upvotes: number; message: string }> {
  const { data, error } = await supabase.rpc('upvote_resource', {
    p_resource_id: resourceId,
    p_fingerprint: fingerprint,
  });

  if (error) {
    console.error('Error upvoting resource:', error);
    return { success: false, upvotes: 0, message: 'Error recording vote' };
  }

  // RPC returns array of rows, get first result
  const result = Array.isArray(data) ? data[0] : data;
  return result || { success: false, upvotes: 0, message: 'Unknown error' };
}

/**
 * Remove an upvote from a resource
 */
export async function removeUpvote(
  resourceId: string,
  fingerprint: string
): Promise<{ success: boolean; upvotes: number; message: string }> {
  const { data, error } = await supabase.rpc('remove_upvote', {
    p_resource_id: resourceId,
    p_fingerprint: fingerprint,
  });

  if (error) {
    console.error('Error removing upvote:', error);
    return { success: false, upvotes: 0, message: 'Error removing vote' };
  }

  const result = Array.isArray(data) ? data[0] : data;
  return result || { success: false, upvotes: 0, message: 'Unknown error' };
}

/**
 * Submit a new resource to the moderation queue
 */
export async function submitResource(resource: {
  name: string;
  description: string;
  url: string;
  category: string;
  eligibility: string[];
  notes?: string;
  submitted_by?: string;
}): Promise<{ success: boolean; message: string; id?: string }> {
  const { data, error } = await supabase
    .from('pending_resources')
    .insert({
      name: resource.name,
      description: resource.description,
      url: resource.url,
      category: resource.category,
      eligibility: resource.eligibility,
      notes: resource.notes || null,
      submitted_by: resource.submitted_by || 'anonymous',
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error submitting resource:', error);
    return { success: false, message: 'Failed to submit resource' };
  }

  return {
    success: true,
    message: 'Resource submitted successfully',
    id: data.id,
  };
}

/**
 * Fetch pending resources (for admin view)
 */
export async function getPendingResources(): Promise<PendingResource[]> {
  const { data, error } = await supabase
    .from('pending_resources')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending resources:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's voted resource IDs (for showing vote state in UI)
 */
export async function getUserVotes(fingerprint: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('resource_id')
    .eq('fingerprint', fingerprint);

  if (error) {
    console.error('Error fetching user votes:', error);
    return [];
  }

  return (data || []).map((vote) => vote.resource_id);
}

/**
 * Submit a report about a resource issue
 */
export async function reportIssue(
  resourceId: string,
  issueType: 'broken-link' | 'wrong-info' | 'outdated' | 'eligibility' | 'other',
  details?: string,
  email?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase.from('resource_reports').insert({
    resource_id: resourceId,
    issue_type: issueType,
    details: details || null,
    email: email || null,
  });

  if (error) {
    console.error('Error submitting report:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
