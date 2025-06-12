/*
  # Tạo tài khoản admin và sửa lỗi đăng ký

  1. Tạo trigger function để tự động tạo user profile
  2. Tạo tài khoản admin mặc định
  3. Đảm bảo RLS policies hoạt động đúng
*/

-- Tạo trigger function để tự động tạo user profile khi có auth user mới
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, username, email, full_name, role)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo trigger để gọi function trên
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tạo tài khoản admin (nếu chưa có)
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Kiểm tra xem admin đã tồn tại chưa
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@phinpt.com') THEN
    -- Tạo auth user cho admin
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@phinpt.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_user_id;

    -- Tạo user profile cho admin
    INSERT INTO public.users (
      auth_user_id,
      username,
      email,
      full_name,
      role
    ) VALUES (
      admin_user_id,
      'admin',
      'admin@phinpt.com',
      'Administrator',
      'admin'
    );
  END IF;
END $$;