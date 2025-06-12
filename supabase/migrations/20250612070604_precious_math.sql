/*
  # Fix Authentication System

  1. Database Changes
    - Drop and recreate user creation trigger with better error handling
    - Fix RLS policies for auth system integration
    - Add proper permissions for supabase_auth_admin

  2. Security
    - Update RLS policies to work with Supabase auth system
    - Grant necessary permissions to auth admin role

  3. Error Handling
    - Improved trigger function with better error handling
    - Unique username generation with collision detection
*/

-- Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_value text;
  full_name_value text;
  phone_value text;
  role_value user_role;
  counter integer := 0;
  base_username text;
BEGIN
  -- Extract and validate metadata
  base_username := COALESCE(
    new.raw_user_meta_data->>'username', 
    split_part(new.email, '@', 1)
  );
  
  username_value := base_username;
  
  full_name_value := COALESCE(
    new.raw_user_meta_data->>'full_name', 
    new.email
  );
  
  phone_value := new.raw_user_meta_data->>'phone';
  
  -- Handle role with proper casting
  BEGIN
    role_value := COALESCE(
      (new.raw_user_meta_data->>'role')::user_role, 
      'client'::user_role
    );
  EXCEPTION WHEN OTHERS THEN
    role_value := 'client'::user_role;
  END;

  -- Ensure username is unique by appending counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) LOOP
    counter := counter + 1;
    username_value := base_username || '_' || counter::text;
    -- Prevent infinite loop
    IF counter > 1000 THEN
      username_value := base_username || '_' || extract(epoch from now())::text;
      EXIT;
    END IF;
  END LOOP;

  -- Insert profile record
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    phone,
    role,
    avatar_url,
    start_date,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    username_value,
    full_name_value,
    phone_value,
    role_value,
    new.raw_user_meta_data->>'avatar_url',
    CURRENT_DATE,
    now(),
    now()
  );

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log the error and re-raise it
  RAISE LOG 'Error in handle_new_user for user %: %', new.id, SQLERRM;
  RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- Drop existing auth system policies to recreate them
DROP POLICY IF EXISTS "Enable insert for auth system" ON public.profiles;
DROP POLICY IF EXISTS "Auth system can read profiles" ON public.profiles;

-- Create policy for auth system to insert profiles
CREATE POLICY "Enable insert for auth system"
  ON public.profiles
  FOR INSERT
  TO supabase_auth_admin
  WITH CHECK (true);

-- Create policy for auth system to read profiles
CREATE POLICY "Auth system can read profiles"
  ON public.profiles
  FOR SELECT
  TO supabase_auth_admin
  USING (true);

-- Ensure the function has proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Add helpful comment
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up via Supabase Auth';