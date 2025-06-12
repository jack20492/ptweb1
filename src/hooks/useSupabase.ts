import { useState } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import type { 
  Profile, 
  WorkoutPlan, 
  Exercise, 
  ExerciseSet, 
  MealPlan, 
  Meal, 
  MealFood, 
  WeightRecord, 
  Testimonial, 
  Video, 
  ContactInfo, 
  HomeContent 
} from '../lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any) => {
    console.error('Supabase error:', error);
    let errorMessage = 'An error occurred';
    
    // Enhanced error handling for connection issues
    if (error?.message?.includes('Failed to fetch') || error?.name === 'TypeError') {
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.';
      console.error('Connection error detected. This might be due to:');
      console.error('1. Invalid Supabase URL or API key');
      console.error('2. Network connectivity issues');
      console.error('3. Supabase service unavailable');
      
      // Test connection to provide more specific error info
      testSupabaseConnection().then(isConnected => {
        if (!isConnected) {
          console.error('Supabase connection test failed. Please verify your configuration.');
        }
      });
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error_description) {
      errorMessage = error.error_description;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    setError(errorMessage);
    setLoading(false);
  };

  // Helper function to check if input is email or username
  const isEmail = (input: string): boolean => {
    return input.includes('@') && input.includes('.');
  };

  // Helper function to get user email by username
  const getUserEmailByUsername = async (username: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
      
      if (error || !data) {
        return null;
      }

      // Get the email from auth.users table using the user ID
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(data.id);
      
      if (authError || !authData.user) {
        return null;
      }

      return authData.user.email || null;
    } catch (error) {
      console.error('Error getting user email by username:', error);
      return null;
    }
  };

  // Auth functions with improved error handling
  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    setError(null);
    try {
      // Test connection first
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      }

      // Validate input
      if (!email || !password) {
        throw new Error('Email và mật khẩu là bắt buộc');
      }
      
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            username: userData.username?.trim(),
            full_name: userData.full_name?.trim(),
            phone: userData.phone?.trim(),
            role: userData.role || 'client'
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        // Provide more user-friendly error messages in Vietnamese
        if (error.message.includes('User already registered')) {
          throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Định dạng email không hợp lệ. Vui lòng nhập email đúng định dạng.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
        } else if (error.message.includes('Database error saving new user')) {
          throw new Error('Lỗi hệ thống khi tạo tài khoản. Vui lòng thử lại sau.');
        }
        
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Không thể tạo tài khoản người dùng');
      }

      return data;
    } catch (error: any) {
      console.error('SignUp error details:', error);
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Test connection first
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      }

      // Validate input
      if (!emailOrUsername || !password) {
        throw new Error('Email/tên đăng nhập và mật khẩu là bắt buộc');
      }

      let email = emailOrUsername.trim();

      // If input is not an email, try to get email by username
      if (!isEmail(emailOrUsername)) {
        const userEmail = await getUserEmailByUsername(emailOrUsername.trim());
        if (!userEmail) {
          throw new Error('Tên đăng nhập không tồn tại. Vui lòng kiểm tra lại.');
        }
        email = userEmail;
      } else {
        email = emailOrUsername.trim().toLowerCase();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('SignIn error:', error);
        
        // Provide more user-friendly error messages in Vietnamese
        if (error.message === 'Invalid login credentials') {
          throw new Error('Email/tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Quá nhiều lần thử đăng nhập. Vui lòng đợi một lúc rồi thử lại.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Định dạng email không hợp lệ.');
        }
        
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Đăng nhập thất bại - không nhận được thông tin người dùng');
      }

      return data;
    } catch (error: any) {
      console.error('SignIn error details:', error);
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Profile functions
  const getProfile = async (userId: string): Promise<Profile | null> => {
    setLoading(true);
    setError(null);
    try {
      // Test connection first
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProfiles = async (): Promise<Profile[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Workout plan functions
  const getWorkoutPlans = async (clientId?: string): Promise<WorkoutPlan[]> => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('workout_plans')
        .select(`
          *,
          exercises (
            *,
            exercise_sets (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createWorkoutPlan = async (workoutPlan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .insert(workoutPlan)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkoutPlan = async (id: string, updates: Partial<WorkoutPlan>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkoutPlan = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Exercise functions
  const createExercise = async (exercise: Omit<Exercise, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert(exercise)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Exercise set functions
  const createExerciseSet = async (exerciseSet: Omit<ExerciseSet, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('exercise_sets')
        .insert(exerciseSet)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateExerciseSet = async (id: string, updates: Partial<ExerciseSet>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('exercise_sets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Meal plan functions
  const getMealPlans = async (clientId?: string): Promise<MealPlan[]> => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            *,
            meal_foods (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert(mealPlan)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMealPlan = async (id: string, updates: Partial<MealPlan>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMealPlan = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Meal functions
  const createMeal = async (meal: Omit<Meal, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert(meal)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Meal food functions
  const createMealFood = async (mealFood: Omit<MealFood, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('meal_foods')
        .insert(mealFood)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Weight record functions
  const getWeightRecords = async (clientId?: string): Promise<WeightRecord[]> => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('weight_records')
        .select('*')
        .order('record_date', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createWeightRecord = async (weightRecord: Omit<WeightRecord, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert(weightRecord)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Testimonial functions
  const getTestimonials = async (): Promise<Testimonial[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAllTestimonials = async (): Promise<Testimonial[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Video functions
  const getVideos = async (): Promise<Video[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAllVideos = async (): Promise<Video[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async (video: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert(video)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Contact info functions
  const getContactInfo = async (): Promise<ContactInfo | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async (updates: Partial<ContactInfo>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .update(updates)
        .limit(1)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Home content functions
  const getHomeContent = async (): Promise<HomeContent | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateHomeContent = async (updates: Partial<HomeContent>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('home_content')
        .update(updates)
        .limit(1)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Auth
    signUp,
    signIn,
    signOut,
    // Profiles
    getProfile,
    updateProfile,
    getProfiles,
    // Workout plans
    getWorkoutPlans,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan,
    // Exercises
    createExercise,
    updateExercise,
    // Exercise sets
    createExerciseSet,
    updateExerciseSet,
    // Meal plans
    getMealPlans,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    // Meals
    createMeal,
    // Meal foods
    createMealFood,
    // Weight records
    getWeightRecords,
    createWeightRecord,
    // Testimonials
    getTestimonials,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    // Videos
    getVideos,
    getAllVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    // Contact info
    getContactInfo,
    updateContactInfo,
    // Home content
    getHomeContent,
    updateHomeContent,
  };
};