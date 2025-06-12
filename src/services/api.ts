import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// Helper function to handle API errors
const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error);
  
  // If it's a network error or API is unavailable, provide fallback
  if (error.code === 'PGRST301' || error.status === 406 || error.status === 500) {
    console.warn(`${operation}: API unavailable, using fallback behavior`);
    return null;
  }
  
  throw error;
};

// Auth Services
export const authService = {
  async signUp(email: string, password: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const username = email.split('@')[0];
        let finalUsername = username;
        let counter = 1;

        // Check if username exists
        try {
          while (true) {
            const { data: existingUser } = await supabase
              .from('users')
              .select('username')
              .eq('username', finalUsername)
              .maybeSingle();

            if (!existingUser) break;
            finalUsername = `${username}${counter}`;
            counter++;
          }
        } catch (error) {
          // If we can't check existing users, just use the original username
          console.warn('Could not check existing usernames, using original');
        }

        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              auth_user_id: authData.user.id,
              username: finalUsername,
              email,
              full_name: username,
              role: 'client',
            });

          if (profileError) throw profileError;
        } catch (error) {
          console.warn('Could not create user profile in database');
        }
      }

      return authData;
    } catch (error) {
      return handleApiError(error, 'Sign up');
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Sign in');
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Sign out');
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      return profile;
    } catch (error) {
      handleApiError(error, 'Get current user');
      return null;
    }
  },
};

// User Services
export const userService = {
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleApiError(error, 'Get users');
      return [];
    }
  },

  async createUser(userData: Tables['users']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Create user');
    }
  },

  async updateUser(id: string, userData: Tables['users']['Update']) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Update user');
    }
  },

  async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Delete user');
    }
  },
};

// Workout Services
export const workoutService = {
  async getWorkoutPlans(clientId?: string) {
    try {
      let query = supabase
        .from('workout_plans')
        .select(`
          *,
          workout_days (
            *,
            exercises (
              *,
              exercise_sets (*)
            )
          )
        `)
        .order('week_number', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to match frontend structure
      return (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        clientId: plan.client_id,
        weekNumber: plan.week_number,
        startDate: plan.start_date,
        createdBy: plan.created_by,
        days: (plan.workout_days || [])
          .sort((a, b) => a.day_order - b.day_order)
          .map(day => ({
            day: day.day_name,
            isRestDay: day.is_rest_day,
            exercises: (day.exercises || [])
              .sort((a, b) => a.exercise_order - b.exercise_order)
              .map(exercise => ({
                id: exercise.id,
                name: exercise.name,
                sets: (exercise.exercise_sets || [])
                  .sort((a, b) => a.set_number - b.set_number)
                  .map(set => ({
                    set: set.set_number,
                    reps: set.reps,
                    reality: set.reality_reps,
                    weight: set.weight,
                    volume: set.volume,
                  })),
              })),
          })),
      }));
    } catch (error) {
      handleApiError(error, 'Get workout plans');
      return [];
    }
  },

  async createWorkoutPlan(planData: any) {
    try {
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          name: planData.name,
          client_id: planData.clientId,
          week_number: planData.weekNumber,
          start_date: planData.startDate,
          created_by: planData.createdBy,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create workout days
      for (let dayIndex = 0; dayIndex < planData.days.length; dayIndex++) {
        const day = planData.days[dayIndex];
        
        const { data: workoutDay, error: dayError } = await supabase
          .from('workout_days')
          .insert({
            workout_plan_id: plan.id,
            day_name: day.day,
            day_order: dayIndex,
            is_rest_day: day.isRestDay,
          })
          .select()
          .single();

        if (dayError) throw dayError;

        if (!day.isRestDay) {
          // Create exercises
          for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex++) {
            const exercise = day.exercises[exerciseIndex];
            
            const { data: exerciseData, error: exerciseError } = await supabase
              .from('exercises')
              .insert({
                workout_day_id: workoutDay.id,
                name: exercise.name,
                exercise_order: exerciseIndex,
              })
              .select()
              .single();

            if (exerciseError) throw exerciseError;

            // Create exercise sets
            const setsData = exercise.sets.map((set: any) => ({
              exercise_id: exerciseData.id,
              set_number: set.set,
              reps: set.reps,
              reality_reps: set.reality,
              weight: set.weight || 0,
              volume: set.volume || 0,
            }));

            const { error: setsError } = await supabase
              .from('exercise_sets')
              .insert(setsData);

            if (setsError) throw setsError;
          }
        }
      }

      return plan;
    } catch (error) {
      return handleApiError(error, 'Create workout plan');
    }
  },

  async updateWorkoutPlan(id: string, planData: any) {
    try {
      // Update plan basic info
      const { error: planError } = await supabase
        .from('workout_plans')
        .update({
          name: planData.name,
        })
        .eq('id', id);

      if (planError) throw planError;

      return { id };
    } catch (error) {
      return handleApiError(error, 'Update workout plan');
    }
  },

  async updateExerciseSet(setId: string, setData: any) {
    try {
      const { data, error } = await supabase
        .from('exercise_sets')
        .update({
          reality_reps: setData.reality,
          weight: setData.weight,
          volume: setData.volume,
        })
        .eq('id', setId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Update exercise set');
    }
  },

  async deleteWorkoutPlan(id: string) {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Delete workout plan');
    }
  },

  async duplicateWorkoutPlan(planId: string, clientId: string) {
    try {
      // Get original plan
      const originalPlans = await this.getWorkoutPlans();
      const originalPlan = originalPlans.find(p => p.id === planId);
      
      if (!originalPlan) throw new Error('Plan not found');

      // Create new plan
      const newPlanData = {
        ...originalPlan,
        clientId,
        weekNumber: 1,
        startDate: new Date().toISOString().split('T')[0],
        createdBy: 'admin',
      };

      return this.createWorkoutPlan(newPlanData);
    } catch (error) {
      return handleApiError(error, 'Duplicate workout plan');
    }
  },
};

// Meal Plan Services
export const mealPlanService = {
  async getMealPlans(clientId?: string) {
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

      // Transform data to match frontend structure
      return (data || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        clientId: plan.client_id,
        totalCalories: plan.total_calories,
        notes: plan.notes,
        meals: (plan.meals || [])
          .sort((a, b) => a.meal_order - b.meal_order)
          .map(meal => ({
            name: meal.name,
            totalCalories: meal.total_calories,
            foods: (meal.meal_foods || [])
              .sort((a, b) => a.food_order - b.food_order)
              .map(food => ({
                name: food.name,
                macroType: food.macro_type,
                calories: food.calories,
                notes: food.notes || '',
              })),
          })),
      }));
    } catch (error) {
      handleApiError(error, 'Get meal plans');
      return [];
    }
  },

  async createMealPlan(planData: any) {
    try {
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          name: planData.name,
          client_id: planData.clientId,
          total_calories: planData.totalCalories,
          notes: planData.notes,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create meals
      for (let mealIndex = 0; mealIndex < planData.meals.length; mealIndex++) {
        const meal = planData.meals[mealIndex];
        
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .insert({
            meal_plan_id: plan.id,
            name: meal.name,
            total_calories: meal.totalCalories,
            meal_order: mealIndex,
          })
          .select()
          .single();

        if (mealError) throw mealError;

        // Create meal foods
        const foodsData = meal.foods.map((food: any, foodIndex: number) => ({
          meal_id: mealData.id,
          name: food.name,
          macro_type: food.macroType,
          calories: food.calories,
          notes: food.notes,
          food_order: foodIndex,
        }));

        const { error: foodsError } = await supabase
          .from('meal_foods')
          .insert(foodsData);

        if (foodsError) throw foodsError;
      }

      return plan;
    } catch (error) {
      return handleApiError(error, 'Create meal plan');
    }
  },

  async updateMealPlan(id: string, planData: any) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update({
          name: planData.name,
          total_calories: planData.totalCalories,
          notes: planData.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Update meal plan');
    }
  },

  async deleteMealPlan(id: string) {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Delete meal plan');
    }
  },
};

// Weight Records Services
export const weightService = {
  async getWeightRecords(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .select('*')
        .eq('client_id', clientId)
        .order('record_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        clientId: record.client_id,
        weight: record.weight,
        date: record.record_date,
        notes: record.notes,
      }));
    } catch (error) {
      handleApiError(error, 'Get weight records');
      return [];
    }
  },

  async addWeightRecord(recordData: any) {
    try {
      const { data, error } = await supabase
        .from('weight_records')
        .insert({
          client_id: recordData.clientId,
          weight: recordData.weight,
          record_date: recordData.date,
          notes: recordData.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Add weight record');
    }
  },
};

// Content Services
export const contentService = {
  async getHomeContent() {
    try {
      const { data, error } = await supabase
        .from('home_content')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Return default content if no data found
        return {
          heroTitle: "Phi Nguyễn Personal Trainer",
          heroSubtitle: "Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness",
          aboutText: "Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.",
          servicesTitle: "Dịch vụ của tôi",
          services: [
            "Tư vấn chế độ tập luyện cá nhân",
            "Thiết kế chương trình dinh dưỡng",
            "Theo dõi tiến độ và điều chỉnh",
            "Hỗ trợ 24/7 qua các kênh liên lạc",
          ],
        };
      }

      return {
        heroTitle: data.hero_title,
        heroSubtitle: data.hero_subtitle,
        heroImage: data.hero_image_url,
        aboutText: data.about_text,
        aboutImage: data.about_image_url,
        servicesTitle: data.services_title,
        services: data.services,
      };
    } catch (error) {
      handleApiError(error, 'Get home content');
      // Return default content if API fails
      return {
        heroTitle: "Phi Nguyễn Personal Trainer",
        heroSubtitle: "Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness",
        aboutText: "Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.",
        servicesTitle: "Dịch vụ của tôi",
        services: [
          "Tư vấn chế độ tập luyện cá nhân",
          "Thiết kế chương trình dinh dưỡng",
          "Theo dõi tiến độ và điều chỉnh",
          "Hỗ trợ 24/7 qua các kênh liên lạc",
        ],
      };
    }
  },

  async updateHomeContent(contentData: any) {
    try {
      // First try to get existing content ID
      const { data: existingContent } = await supabase
        .from('home_content')
        .select('id')
        .maybeSingle();

      let contentId = existingContent?.id;

      if (!contentId) {
        // Create new content if none exists
        const { data: newContent, error: createError } = await supabase
          .from('home_content')
          .insert({
            hero_title: contentData.heroTitle,
            hero_subtitle: contentData.heroSubtitle,
            hero_image_url: contentData.heroImage,
            about_text: contentData.aboutText,
            about_image_url: contentData.aboutImage,
            services_title: contentData.servicesTitle,
            services: contentData.services,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newContent;
      }

      // Update existing content
      const { data, error } = await supabase
        .from('home_content')
        .update({
          hero_title: contentData.heroTitle,
          hero_subtitle: contentData.heroSubtitle,
          hero_image_url: contentData.heroImage,
          about_text: contentData.aboutText,
          about_image_url: contentData.aboutImage,
          services_title: contentData.servicesTitle,
          services: contentData.services,
        })
        .eq('id', contentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Update home content');
    }
  },

  async getContactInfo() {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Return default contact info if no data found
        return {
          phone: "0123456789",
          facebook: "https://facebook.com/phinpt",
          zalo: "https://zalo.me/0123456789",
          email: "contact@phinpt.com",
        };
      }

      return data;
    } catch (error) {
      handleApiError(error, 'Get contact info');
      // Return default contact info if API fails
      return {
        phone: "0123456789",
        facebook: "https://facebook.com/phinpt",
        zalo: "https://zalo.me/0123456789",
        email: "contact@phinpt.com",
      };
    }
  },

  async updateContactInfo(contactData: any) {
    try {
      // First try to get existing contact info ID
      const { data: existingContact } = await supabase
        .from('contact_info')
        .select('id')
        .maybeSingle();

      let contactId = existingContact?.id;

      if (!contactId) {
        // Create new contact info if none exists
        const { data: newContact, error: createError } = await supabase
          .from('contact_info')
          .insert(contactData)
          .select()
          .single();

        if (createError) throw createError;
        return newContact;
      }

      // Update existing contact info
      const { data, error } = await supabase
        .from('contact_info')
        .update(contactData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Update contact info');
    }
  },

  async getTestimonials() {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(testimonial => ({
        id: testimonial.id,
        name: testimonial.name,
        content: testimonial.content,
        rating: testimonial.rating,
        avatar: testimonial.avatar_url,
        beforeImage: testimonial.before_image_url,
        afterImage: testimonial.after_image_url,
      }));
    } catch (error) {
      handleApiError(error, 'Get testimonials');
      // Return default testimonials if API fails
      return [
        {
          id: "1",
          name: "Nguyễn Minh Anh",
          content: "Sau 3 tháng tập với PT Phi, tôi đã giảm được 8kg và cảm thấy khỏe khoắn hơn rất nhiều. Chương trình tập rất khoa học và phù hợp.",
          rating: 5,
        },
        {
          id: "2",
          name: "Trần Văn Đức",
          content: "PT Phi rất nhiệt tình và chuyên nghiệp. Nhờ có sự hướng dẫn tận tình, tôi đã tăng được 5kg cơ trong 4 tháng.",
          rating: 5,
        },
      ];
    }
  },

  async createTestimonial(testimonialData: any) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          name: testimonialData.name,
          content: testimonialData.content,
          rating: testimonialData.rating,
          avatar_url: testimonialData.avatar,
          before_image_url: testimonialData.beforeImage,
          after_image_url: testimonialData.afterImage,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Create testimonial');
    }
  },

  async updateTestimonial(id: string, testimonialData: any) {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update({
          name: testimonialData.name,
          content: testimonialData.content,
          rating: testimonialData.rating,
          avatar_url: testimonialData.avatar,
          before_image_url: testimonialData.beforeImage,
          after_image_url: testimonialData.afterImage,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Update testimonial');
    }
  },

  async deleteTestimonial(id: string) {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Delete testimonial');
    }
  },

  async getVideos() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(video => ({
        id: video.id,
        title: video.title,
        youtubeId: video.youtube_id,
        description: video.description,
        category: video.category,
      }));
    } catch (error) {
      handleApiError(error, 'Get videos');
      // Return default videos if API fails
      return [
        {
          id: "1",
          title: "Bài tập cardio cơ bản tại nhà",
          youtubeId: "dQw4w9WgXcQ",
          description: "Hướng dẫn các bài tập cardio đơn giản có thể thực hiện tại nhà",
          category: "Cardio",
        },
        {
          id: "2",
          title: "Tập ngực cho người mới bắt đầu",
          youtubeId: "dQw4w9WgXcQ",
          description: "Các bài tập phát triển cơ ngực hiệu quả dành cho newbie",
          category: "Strength",
        },
      ];
    }
  },

  async createVideo(videoData: any) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          title: videoData.title,
          youtube_id: videoData.youtubeId,
          description: videoData.description,
          category: videoData.category,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Create video');
    }
  },

  async updateVideo(id: string, videoData: any) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update({
          title: videoData.title,
          youtube_id: videoData.youtubeId,
          description: videoData.description,
          category: videoData.category,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, 'Update video');
    }
  },

  async deleteVideo(id: string) {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Delete video');
    }
  },
};