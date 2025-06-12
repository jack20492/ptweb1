/*
  # Complete PT Website Database Schema

  1. Tables
    - users: User authentication and profiles
    - workout_plans: Workout plans created by admin
    - workout_days: Days within workout plans
    - exercises: Exercises within workout days
    - exercise_sets: Sets within exercises
    - meal_plans: Meal plans for clients
    - meals: Individual meals within meal plans
    - meal_foods: Foods within meals
    - weight_records: Client weight tracking
    - testimonials: Client testimonials
    - videos: Training videos
    - home_content: Homepage content
    - contact_info: Contact information

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for admin and client access
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
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

-- Workout Plans
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  week_number integer NOT NULL DEFAULT 1,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by text DEFAULT 'admin' CHECK (created_by IN ('admin', 'client')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout Days
CREATE TABLE IF NOT EXISTS workout_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE CASCADE,
  day_name text NOT NULL,
  day_order integer NOT NULL,
  is_rest_day boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_day_id uuid REFERENCES workout_days(id) ON DELETE CASCADE,
  name text NOT NULL,
  exercise_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Exercise Sets
CREATE TABLE IF NOT EXISTS exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  set_number integer NOT NULL,
  reps integer NOT NULL,
  reality_reps integer,
  weight numeric(5,2) DEFAULT 0,
  volume numeric(8,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meal Plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Chế độ dinh dưỡng',
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  total_calories integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meals
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid REFERENCES meal_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_calories integer DEFAULT 0,
  meal_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Meal Foods
CREATE TABLE IF NOT EXISTS meal_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid REFERENCES meals(id) ON DELETE CASCADE,
  name text NOT NULL,
  macro_type text NOT NULL CHECK (macro_type IN ('Carb', 'Pro', 'Fat')),
  calories integer NOT NULL DEFAULT 0,
  notes text,
  food_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Weight Records
CREATE TABLE IF NOT EXISTS weight_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  weight numeric(5,2) NOT NULL,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url text,
  before_image_url text,
  after_image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  youtube_id text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Home Content
CREATE TABLE IF NOT EXISTS home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  hero_image_url text,
  about_text text NOT NULL,
  about_image_url text,
  services_title text NOT NULL,
  services jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contact Info
CREATE TABLE IF NOT EXISTS contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  facebook text NOT NULL,
  zalo text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_user_id);

-- RLS Policies for Workout Plans
CREATE POLICY "Clients can read own workout plans" ON workout_plans
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all workout plans" ON workout_plans
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage workout plans" ON workout_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can create new week plans" ON workout_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) AND created_by = 'client'
  );

-- RLS Policies for Workout Days
CREATE POLICY "Users can read workout days" ON workout_days
  FOR SELECT TO authenticated
  USING (
    workout_plan_id IN (
      SELECT wp.id FROM workout_plans wp
      JOIN users u ON wp.client_id = u.id
      WHERE u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage workout days" ON workout_days
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Exercises
CREATE POLICY "Users can read exercises" ON exercises
  FOR SELECT TO authenticated
  USING (
    workout_day_id IN (
      SELECT wd.id FROM workout_days wd
      JOIN workout_plans wp ON wd.workout_plan_id = wp.id
      JOIN users u ON wp.client_id = u.id
      WHERE u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage exercises" ON exercises
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Exercise Sets
CREATE POLICY "Users can read exercise sets" ON exercise_sets
  FOR SELECT TO authenticated
  USING (
    exercise_id IN (
      SELECT e.id FROM exercises e
      JOIN workout_days wd ON e.workout_day_id = wd.id
      JOIN workout_plans wp ON wd.workout_plan_id = wp.id
      JOIN users u ON wp.client_id = u.id
      WHERE u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own exercise sets" ON exercise_sets
  FOR UPDATE TO authenticated
  USING (
    exercise_id IN (
      SELECT e.id FROM exercises e
      JOIN workout_days wd ON e.workout_day_id = wd.id
      JOIN workout_plans wp ON wd.workout_plan_id = wp.id
      JOIN users u ON wp.client_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage exercise sets" ON exercise_sets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Meal Plans
CREATE POLICY "Clients can read own meal plans" ON meal_plans
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage meal plans" ON meal_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Meals
CREATE POLICY "Users can read meals" ON meals
  FOR SELECT TO authenticated
  USING (
    meal_plan_id IN (
      SELECT mp.id FROM meal_plans mp
      JOIN users u ON mp.client_id = u.id
      WHERE u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage meals" ON meals
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Meal Foods
CREATE POLICY "Users can read meal foods" ON meal_foods
  FOR SELECT TO authenticated
  USING (
    meal_id IN (
      SELECT m.id FROM meals m
      JOIN meal_plans mp ON m.meal_plan_id = mp.id
      JOIN users u ON mp.client_id = u.id
      WHERE u.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage meal foods" ON meal_foods
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Weight Records
CREATE POLICY "Clients can read own weight records" ON weight_records
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can insert own weight records" ON weight_records
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all weight records" ON weight_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Public Content (Testimonials, Videos, Home Content, Contact Info)
CREATE POLICY "Anyone can read testimonials" ON testimonials
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read videos" ON videos
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage videos" ON videos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read home content" ON home_content
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage home content" ON home_content
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can read contact info" ON contact_info
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage contact info" ON contact_info
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default data
INSERT INTO home_content (hero_title, hero_subtitle, about_text, services_title, services) VALUES (
  'Phi Nguyễn Personal Trainer',
  'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness',
  'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.',
  'Dịch vụ của tôi',
  '["Tư vấn chế độ tập luyện cá nhân", "Thiết kế chương trình dinh dưỡng", "Theo dõi tiến độ và điều chỉnh", "Hỗ trợ 24/7 qua các kênh liên lạc"]'
) ON CONFLICT DO NOTHING;

INSERT INTO contact_info (phone, facebook, zalo, email) VALUES (
  '0123456789',
  'https://facebook.com/phinpt',
  'https://zalo.me/0123456789',
  'contact@phinpt.com'
) ON CONFLICT DO NOTHING;

-- Insert default testimonials
INSERT INTO testimonials (name, content, rating) VALUES 
(
  'Nguyễn Minh Anh',
  'Sau 3 tháng tập với PT Phi, tôi đã giảm được 8kg và cảm thấy khỏe khoắn hơn rất nhiều. Chương trình tập rất khoa học và phù hợp.',
  5
),
(
  'Trần Văn Đức',
  'PT Phi rất nhiệt tình và chuyên nghiệp. Nhờ có sự hướng dẫn tận tình, tôi đã tăng được 5kg cơ trong 4 tháng.',
  5
) ON CONFLICT DO NOTHING;

-- Insert default videos
INSERT INTO videos (title, youtube_id, description, category) VALUES 
(
  'Bài tập cardio cơ bản tại nhà',
  'dQw4w9WgXcQ',
  'Hướng dẫn các bài tập cardio đơn giản có thể thực hiện tại nhà',
  'Cardio'
),
(
  'Tập ngực cho người mới bắt đầu',
  'dQw4w9WgXcQ',
  'Các bài tập phát triển cơ ngực hiệu quả dành cho newbie',
  'Strength'
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_workout_plans_client_id ON workout_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_week_number ON workout_plans(week_number);
CREATE INDEX IF NOT EXISTS idx_workout_days_plan_id ON workout_days(workout_plan_id);
CREATE INDEX IF NOT EXISTS idx_exercises_day_id ON exercises(workout_day_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_exercise_id ON exercise_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_client_id ON meal_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_meals_plan_id ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal_id ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_client_id ON weight_records(client_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_date ON weight_records(record_date);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON workout_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercise_sets_updated_at BEFORE UPDATE ON exercise_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_home_content_updated_at BEFORE UPDATE ON home_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();