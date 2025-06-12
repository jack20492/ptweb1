-- Fix users table to ensure role column exists
-- This migration ensures the users table has all required columns

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  avatar_url text,
  start_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client'));
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple policy for authenticated users
DROP POLICY IF EXISTS "authenticated_users_all_access" ON public.users;
CREATE POLICY "authenticated_users_all_access" ON public.users
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user if not exists
DO $$
BEGIN
  -- Check if admin user already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@phinpt.com'
  ) THEN
    -- Insert admin user (you'll need to create the auth user separately)
    INSERT INTO public.users (
      username, 
      email, 
      full_name, 
      role
    ) VALUES (
      'admin',
      'admin@phinpt.com',
      'Admin User',
      'admin'
    );
  END IF;
END $$;