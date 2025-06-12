/*
  # Fix Authentication Trigger Function

  This migration fixes the handle_new_user trigger function to resolve 500 errors during signup.
  
  ## Changes Made:
  1. Improved error handling and logging
  2. Better metadata extraction with null safety
  3. More robust username generation
  4. Proper role validation
  5. Enhanced permissions and policies
  6. Added debugging capabilities
*/

-- Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with comprehensive error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_value text;
  full_name_value text;
  phone_value text;
  role_value user_role;
  counter integer := 0;
  base_username text;
  metadata_json jsonb;
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user triggered for user ID: %', new.id;
  
  -- Safely extract metadata
  metadata_json := COALESCE(new.raw_user_meta_data, '{}'::jsonb);
  
  -- Log metadata for debugging
  RAISE LOG 'User metadata: %', metadata_json;
  
  -- Extract username with better fallback logic
  base_username := COALESCE(
    NULLIF(trim(metadata_json->>'username'), ''),
    NULLIF(trim(split_part(COALESCE(new.email, ''), '@', 1)), ''),
    'user_' || substring(new.id::text, 1, 8)
  );
  
  -- Ensure base_username is not empty and is valid
  IF base_username IS NULL OR length(base_username) = 0 THEN
    base_username := 'user_' || substring(new.id::text, 1, 8);
  END IF;
  
  username_value := base_username;
  
  -- Extract full name with better fallback
  full_name_value := COALESCE(
    NULLIF(trim(metadata_json->>'full_name'), ''),
    NULLIF(trim(new.email), ''),
    'User ' || substring(new.id::text, 1, 8)
  );
  
  -- Extract phone (can be null)
  phone_value := NULLIF(trim(metadata_json->>'phone'), '');
  
  -- Handle role with comprehensive validation
  BEGIN
    -- First try to cast the role from metadata
    IF metadata_json ? 'role' AND metadata_json->>'role' IS NOT NULL THEN
      role_value := (metadata_json->>'role')::user_role;
    ELSE
      role_value := 'client'::user_role;
    END IF;
  EXCEPTION 
    WHEN invalid_text_representation THEN
      RAISE LOG 'Invalid role value in metadata: %, defaulting to client', metadata_json->>'role';
      role_value := 'client'::user_role;
    WHEN OTHERS THEN
      RAISE LOG 'Error processing role: %, defaulting to client', SQLERRM;
      role_value := 'client'::user_role;
  END;

  -- Ensure username is unique with improved logic
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_value) LOOP
    counter := counter + 1;
    username_value := base_username || '_' || counter::text;
    
    -- Prevent infinite loop with reasonable limit
    IF counter > 100 THEN
      username_value := base_username || '_' || extract(epoch from now())::bigint::text;
      RAISE LOG 'Username collision limit reached, using timestamp: %', username_value;
      EXIT;
    END IF;
  END LOOP;

  -- Log the values we're about to insert
  RAISE LOG 'Inserting profile - ID: %, Username: %, Full Name: %, Role: %', 
    new.id, username_value, full_name_value, role_value;

  -- Insert profile record with explicit error handling
  BEGIN
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
      NULLIF(trim(metadata_json->>'avatar_url'), ''),
      CURRENT_DATE,
      now(),
      now()
    );
    
    RAISE LOG 'Successfully created profile for user: %', new.id;
    
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Profile creation failed: Username or ID already exists. ID: %, Username: %', 
        new.id, username_value;
    WHEN not_null_violation THEN
      RAISE EXCEPTION 'Profile creation failed: Required field is null. Details: %', SQLERRM;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Profile creation failed with unexpected error: %', SQLERRM;
  END;

  RETURN new;
  
EXCEPTION WHEN OTHERS THEN
  -- Comprehensive error logging
  RAISE LOG 'Critical error in handle_new_user for user % (email: %): %', 
    new.id, new.email, SQLERRM;
  RAISE LOG 'User metadata was: %', new.raw_user_meta_data;
  
  -- Re-raise with more context
  RAISE EXCEPTION 'User profile creation failed for %: %', new.email, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set function ownership and permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure comprehensive permissions for auth system
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Drop and recreate auth system policies
DROP POLICY IF EXISTS "Enable insert for auth system" ON public.profiles;
DROP POLICY IF EXISTS "Auth system can read profiles" ON public.profiles;

-- Create comprehensive policies for auth system
CREATE POLICY "Enable insert for auth system"
  ON public.profiles
  FOR INSERT
  TO supabase_auth_admin
  WITH CHECK (true);

CREATE POLICY "Auth system can read profiles"
  ON public.profiles
  FOR SELECT
  TO supabase_auth_admin
  USING (true);

-- Also allow auth system to update profiles if needed
CREATE POLICY "Auth system can update profiles"
  ON public.profiles
  FOR UPDATE
  TO supabase_auth_admin
  USING (true)
  WITH CHECK (true);

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new user signs up via Supabase Auth. Includes comprehensive error handling and logging.';

-- Verify the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created' 
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) THEN
    RAISE EXCEPTION 'Trigger on_auth_user_created was not created successfully';
  END IF;
  
  RAISE NOTICE 'Trigger on_auth_user_created created successfully';
END $$;