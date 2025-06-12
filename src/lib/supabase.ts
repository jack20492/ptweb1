import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          username: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'client'
          avatar_url: string | null
          start_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          username: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'admin' | 'client'
          avatar_url?: string | null
          start_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          username?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'client'
          avatar_url?: string | null
          start_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      workout_plans: {
        Row: {
          id: string
          name: string
          client_id: string | null
          week_number: number
          start_date: string
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          client_id?: string | null
          week_number?: number
          start_date?: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          client_id?: string | null
          week_number?: number
          start_date?: string
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      testimonials: {
        Row: {
          id: string
          name: string
          content: string
          rating: number
          avatar_url: string | null
          before_image_url: string | null
          after_image_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          content: string
          rating?: number
          avatar_url?: string | null
          before_image_url?: string | null
          after_image_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          content?: string
          rating?: number
          avatar_url?: string | null
          before_image_url?: string | null
          after_image_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          youtube_id: string
          description: string
          category: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          youtube_id: string
          description: string
          category: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          youtube_id?: string
          description?: string
          category?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      home_content: {
        Row: {
          id: string
          hero_title: string
          hero_subtitle: string
          hero_image_url: string | null
          about_text: string
          about_image_url: string | null
          services_title: string
          services: any
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          hero_title: string
          hero_subtitle: string
          hero_image_url?: string | null
          about_text: string
          about_image_url?: string | null
          services_title: string
          services?: any
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          hero_title?: string
          hero_subtitle?: string
          hero_image_url?: string | null
          about_text?: string
          about_image_url?: string | null
          services_title?: string
          services?: any
          created_at?: string | null
          updated_at?: string | null
        }
      }
      contact_info: {
        Row: {
          id: string
          phone: string
          facebook: string
          zalo: string
          email: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          phone: string
          facebook: string
          zalo: string
          email: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          phone?: string
          facebook?: string
          zalo?: string
          email?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}