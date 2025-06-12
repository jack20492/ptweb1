/*
  # Initial Schema for Personal Trainer Application

  1. New Tables
    - `profiles` - User profile information extending Supabase auth.users
    - `workout_plans` - Workout plans created by trainers for clients
    - `exercises` - Individual exercises within workout plans
    - `exercise_sets` - Sets data for each exercise
    - `meal_plans` - Nutrition plans for clients
    - `meals` - Individual meals within meal plans
    - `meal_foods` - Food items within each meal
    - `weight_records` - Weight tracking records for clients
    - `testimonials` - Client testimonials and reviews
    - `videos` - Training videos and tutorials
    - `contact_info` - Contact information settings
    - `home_content` - Homepage content management

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Separate admin and client access levels
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE macro_type AS ENUM ('Carb', 'Pro', 'Fat');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url text,
  start_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout plans table
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number integer NOT NULL DEFAULT 1,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_name text NOT NULL,
  is_rest_day boolean NOT NULL DEFAULT false,
  exercise_name text,
  exercise_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Exercise sets table
CREATE TABLE IF NOT EXISTS exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  target_reps integer NOT NULL,
  actual_reps integer,
  weight_kg decimal(5,2) DEFAULT 0,
  volume decimal(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Meal Plan',
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_calories integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_calories integer NOT NULL DEFAULT 0,
  meal_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Meal foods table
CREATE TABLE IF NOT EXISTS meal_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  name text NOT NULL,
  macro_type macro_type NOT NULL DEFAULT 'Carb',
  calories integer NOT NULL DEFAULT 0,
  notes text,
  food_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Weight records table
CREATE TABLE IF NOT EXISTS weight_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg decimal(5,2) NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url text,
  before_image_url text,
  after_image_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_id text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact info table
CREATE TABLE IF NOT EXISTS contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  facebook_url text NOT NULL,
  zalo_url text NOT NULL,
  email text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Home content table
CREATE TABLE IF NOT EXISTS home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  hero_image_url text,
  about_text text NOT NULL,
  about_image_url text,
  services_title text NOT NULL,
  services jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Workout plans policies
CREATE POLICY "Clients can read own workout plans"
  ON workout_plans
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can update own workout plans"
  ON workout_plans
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all workout plans"
  ON workout_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exercises policies
CREATE POLICY "Users can read exercises for their workout plans"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (
    workout_plan_id IN (
      SELECT id FROM workout_plans
      WHERE client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update exercises for their workout plans"
  ON exercises
  FOR UPDATE
  TO authenticated
  USING (
    workout_plan_id IN (
      SELECT id FROM workout_plans
      WHERE client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all exercises"
  ON exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exercise sets policies
CREATE POLICY "Users can read sets for their exercises"
  ON exercise_sets
  FOR SELECT
  TO authenticated
  USING (
    exercise_id IN (
      SELECT e.id FROM exercises e
      JOIN workout_plans wp ON e.workout_plan_id = wp.id
      WHERE wp.client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update sets for their exercises"
  ON exercise_sets
  FOR UPDATE
  TO authenticated
  USING (
    exercise_id IN (
      SELECT e.id FROM exercises e
      JOIN workout_plans wp ON e.workout_plan_id = wp.id
      WHERE wp.client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all exercise sets"
  ON exercise_sets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Meal plans policies
CREATE POLICY "Clients can read own meal plans"
  ON meal_plans
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all meal plans"
  ON meal_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Meals policies
CREATE POLICY "Users can read meals for their meal plans"
  ON meals
  FOR SELECT
  TO authenticated
  USING (
    meal_plan_id IN (
      SELECT id FROM meal_plans
      WHERE client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all meals"
  ON meals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Meal foods policies
CREATE POLICY "Users can read foods for their meals"
  ON meal_foods
  FOR SELECT
  TO authenticated
  USING (
    meal_id IN (
      SELECT m.id FROM meals m
      JOIN meal_plans mp ON m.meal_plan_id = mp.id
      WHERE mp.client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all meal foods"
  ON meal_foods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Weight records policies
CREATE POLICY "Clients can read own weight records"
  ON weight_records
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can insert own weight records"
  ON weight_records
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can manage all weight records"
  ON weight_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public content policies (testimonials, videos, contact_info, home_content)
CREATE POLICY "Anyone can read published testimonials"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage all testimonials"
  ON testimonials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read published videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage all videos"
  ON videos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read contact info"
  ON contact_info
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage contact info"
  ON contact_info
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read home content"
  ON home_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage home content"
  ON home_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default data
INSERT INTO contact_info (phone, facebook_url, zalo_url, email) VALUES
('0123456789', 'https://facebook.com/phinpt', 'https://zalo.me/0123456789', 'contact@phinpt.com')
ON CONFLICT DO NOTHING;

INSERT INTO home_content (hero_title, hero_subtitle, about_text, services_title, services) VALUES
(
  'Phi Nguyễn Personal Trainer',
  'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness',
  'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.',
  'Dịch vụ của tôi',
  '["Tư vấn chế độ tập luyện cá nhân", "Thiết kế chương trình dinh dưỡng", "Theo dõi tiến độ và điều chỉnh", "Hỗ trợ 24/7 qua các kênh liên lạc"]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON workout_plans FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON home_content FOR EACH ROW EXECUTE FUNCTION handle_updated_at();