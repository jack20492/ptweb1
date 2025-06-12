import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log the status for debugging
if (!supabase) {
  console.warn('Supabase client not initialized - environment variables missing. Using localStorage fallback.');
} else {
  console.log('Supabase client initialized successfully');
}

// Database types (keeping for future use)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          username: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: 'admin' | 'client';
          avatar_url: string | null;
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          username: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role?: 'admin' | 'client';
          avatar_url?: string | null;
          start_date?: string;
        };
        Update: {
          username?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: 'admin' | 'client';
          avatar_url?: string | null;
        };
      };
    };
  };
}