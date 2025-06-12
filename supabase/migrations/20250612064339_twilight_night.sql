/*
  # Fix user registration trigger

  1. Database Functions
    - Create or replace the handle_new_user function that creates profile records
    - This function will be triggered when a new user signs up via Supabase Auth

  2. Triggers
    - Create trigger on auth.users table to automatically create profile records
    - Ensures every new user gets a corresponding profile entry

  3. Security
    - Grant necessary permissions for the trigger to work
    - Ensure RLS policies allow the trigger to insert profile records
*/

-- Create or replace the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    phone,
    role,
    avatar_url,
    start_date
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', new.email),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
    new.raw_user_meta_data->>'avatar_url',
    CURRENT_DATE
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;

-- Ensure the profiles table has proper RLS policies for the trigger
DO $$
BEGIN
  -- Add a policy to allow the auth system to insert profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Enable insert for auth system'
  ) THEN
    CREATE POLICY "Enable insert for auth system"
      ON public.profiles
      FOR INSERT
      TO supabase_auth_admin
      WITH CHECK (true);
  END IF;
END $$;