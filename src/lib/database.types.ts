/**
 * Supabase Database Types
 * Generated for Free Stuff at Big Green schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      resources: {
        Row: {
          id: string
          name: string
          description: string
          url: string
          category: string
          eligibility: string[]
          last_verified: string
          notes: string | null
          source: string | null
          added_at: string
          added_by: string
          upvotes: number
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          url: string
          category: string
          eligibility?: string[]
          last_verified?: string
          notes?: string | null
          source?: string | null
          added_at?: string
          added_by?: string
          upvotes?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          url?: string
          category?: string
          eligibility?: string[]
          last_verified?: string
          notes?: string | null
          source?: string | null
          added_at?: string
          added_by?: string
          upvotes?: number
          is_active?: boolean
        }
      }
      votes: {
        Row: {
          id: string
          resource_id: string
          fingerprint: string
          voted_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          fingerprint: string
          voted_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          fingerprint?: string
          voted_at?: string
        }
      }
      pending_resources: {
        Row: {
          id: string
          name: string
          description: string | null
          url: string
          category: string | null
          eligibility: string[]
          notes: string | null
          submitted_by: string | null
          submitted_at: string
          status: 'pending' | 'approved' | 'rejected'
          agent_source: 'verify' | 'discover' | 'draft' | null
          reviewed_at: string | null
          reviewer_notes: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          url: string
          category?: string | null
          eligibility?: string[]
          notes?: string | null
          submitted_by?: string | null
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          agent_source?: 'verify' | 'discover' | 'draft' | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          url?: string
          category?: string | null
          eligibility?: string[]
          notes?: string | null
          submitted_by?: string | null
          submitted_at?: string
          status?: 'pending' | 'approved' | 'rejected'
          agent_source?: 'verify' | 'discover' | 'draft' | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
        }
      }
    }
    Functions: {
      upvote_resource: {
        Args: {
          p_resource_id: string
          p_fingerprint: string
        }
        Returns: {
          success: boolean
          upvotes: number
          message: string
        }[]
      }
      remove_upvote: {
        Args: {
          p_resource_id: string
          p_fingerprint: string
        }
        Returns: {
          success: boolean
          upvotes: number
          message: string
        }[]
      }
    }
  }
}
