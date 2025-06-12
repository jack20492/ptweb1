import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
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
      workout_plans: {
        Row: {
          id: string;
          name: string;
          client_id: string;
          week_number: number;
          start_date: string;
          created_by: 'admin' | 'client';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          client_id: string;
          week_number?: number;
          start_date?: string;
          created_by?: 'admin' | 'client';
        };
        Update: {
          name?: string;
          week_number?: number;
          start_date?: string;
        };
      };
      workout_days: {
        Row: {
          id: string;
          workout_plan_id: string;
          day_name: string;
          day_order: number;
          is_rest_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_plan_id: string;
          day_name: string;
          day_order: number;
          is_rest_day?: boolean;
        };
        Update: {
          day_name?: string;
          day_order?: number;
          is_rest_day?: boolean;
        };
      };
      exercises: {
        Row: {
          id: string;
          workout_day_id: string;
          name: string;
          exercise_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_day_id: string;
          name: string;
          exercise_order: number;
        };
        Update: {
          name?: string;
          exercise_order?: number;
        };
      };
      exercise_sets: {
        Row: {
          id: string;
          exercise_id: string;
          set_number: number;
          reps: number;
          reality_reps: number | null;
          weight: number;
          volume: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exercise_id: string;
          set_number: number;
          reps: number;
          reality_reps?: number | null;
          weight?: number;
          volume?: number;
        };
        Update: {
          reps?: number;
          reality_reps?: number | null;
          weight?: number;
          volume?: number;
        };
      };
      meal_plans: {
        Row: {
          id: string;
          name: string;
          client_id: string;
          total_calories: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          client_id: string;
          total_calories?: number;
          notes?: string | null;
        };
        Update: {
          name?: string;
          total_calories?: number;
          notes?: string | null;
        };
      };
      meals: {
        Row: {
          id: string;
          meal_plan_id: string;
          name: string;
          total_calories: number;
          meal_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_plan_id: string;
          name: string;
          total_calories?: number;
          meal_order: number;
        };
        Update: {
          name?: string;
          total_calories?: number;
          meal_order?: number;
        };
      };
      meal_foods: {
        Row: {
          id: string;
          meal_id: string;
          name: string;
          macro_type: 'Carb' | 'Pro' | 'Fat';
          calories: number;
          notes: string | null;
          food_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_id: string;
          name: string;
          macro_type: 'Carb' | 'Pro' | 'Fat';
          calories?: number;
          notes?: string | null;
          food_order: number;
        };
        Update: {
          name?: string;
          macro_type?: 'Carb' | 'Pro' | 'Fat';
          calories?: number;
          notes?: string | null;
          food_order?: number;
        };
      };
      weight_records: {
        Row: {
          id: string;
          client_id: string;
          weight: number;
          record_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          weight: number;
          record_date?: string;
          notes?: string | null;
        };
        Update: {
          weight?: number;
          record_date?: string;
          notes?: string | null;
        };
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          content: string;
          rating: number;
          avatar_url: string | null;
          before_image_url: string | null;
          after_image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          rating?: number;
          avatar_url?: string | null;
          before_image_url?: string | null;
          after_image_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          content?: string;
          rating?: number;
          avatar_url?: string | null;
          before_image_url?: string | null;
          after_image_url?: string | null;
          is_active?: boolean;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          youtube_id: string;
          description: string;
          category: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          youtube_id: string;
          description: string;
          category: string;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          youtube_id?: string;
          description?: string;
          category?: string;
          is_active?: boolean;
        };
      };
      home_content: {
        Row: {
          id: string;
          hero_title: string;
          hero_subtitle: string;
          hero_image_url: string | null;
          about_text: string;
          about_image_url: string | null;
          services_title: string;
          services: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hero_title: string;
          hero_subtitle: string;
          hero_image_url?: string | null;
          about_text: string;
          about_image_url?: string | null;
          services_title: string;
          services: string[];
        };
        Update: {
          hero_title?: string;
          hero_subtitle?: string;
          hero_image_url?: string | null;
          about_text?: string;
          about_image_url?: string | null;
          services_title?: string;
          services?: string[];
        };
      };
      contact_info: {
        Row: {
          id: string;
          phone: string;
          facebook: string;
          zalo: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          facebook: string;
          zalo: string;
          email: string;
        };
        Update: {
          phone?: string;
          facebook?: string;
          zalo?: string;
          email?: string;
        };
      };
    };
  };
}