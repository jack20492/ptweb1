import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// Auth Services
export const authService = {
  async signUp(email: string, password: string) {
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
      while (true) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('username')
          .eq('username', finalUsername)
          .single();

        if (!existingUser) break;
        finalUsername = `${username}${counter}`;
        counter++;
      }

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
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    return profile;
  },
};

// User Services
export const userService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createUser(userData: Tables['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, userData: Tables['users']['Update']) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Workout Services
export const workoutService = {
  async getWorkoutPlans(clientId?: string) {
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
    return data.map(plan => ({
      id: plan.id,
      name: plan.name,
      clientId: plan.client_id,
      weekNumber: plan.week_number,
      startDate: plan.start_date,
      createdBy: plan.created_by,
      days: plan.workout_days
        .sort((a, b) => a.day_order - b.day_order)
        .map(day => ({
          day: day.day_name,
          isRestDay: day.is_rest_day,
          exercises: day.exercises
            .sort((a, b) => a.exercise_order - b.exercise_order)
            .map(exercise => ({
              id: exercise.id,
              name: exercise.name,
              sets: exercise.exercise_sets
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
  },

  async createWorkoutPlan(planData: any) {
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
  },

  async updateWorkoutPlan(id: string, planData: any) {
    // Update plan basic info
    const { error: planError } = await supabase
      .from('workout_plans')
      .update({
        name: planData.name,
      })
      .eq('id', id);

    if (planError) throw planError;

    // For now, we'll handle exercise set updates separately
    // This is a simplified version - in production you might want more granular updates
    return { id };
  },

  async updateExerciseSet(setId: string, setData: any) {
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
  },

  async deleteWorkoutPlan(id: string) {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async duplicateWorkoutPlan(planId: string, clientId: string) {
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
  },
};

// Meal Plan Services
export const mealPlanService = {
  async getMealPlans(clientId?: string) {
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
    return data.map(plan => ({
      id: plan.id,
      name: plan.name,
      clientId: plan.client_id,
      totalCalories: plan.total_calories,
      notes: plan.notes,
      meals: plan.meals
        .sort((a, b) => a.meal_order - b.meal_order)
        .map(meal => ({
          name: meal.name,
          totalCalories: meal.total_calories,
          foods: meal.meal_foods
            .sort((a, b) => a.food_order - b.food_order)
            .map(food => ({
              name: food.name,
              macroType: food.macro_type,
              calories: food.calories,
              notes: food.notes || '',
            })),
        })),
    }));
  },

  async createMealPlan(planData: any) {
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
  },

  async updateMealPlan(id: string, planData: any) {
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
  },

  async deleteMealPlan(id: string) {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Weight Records Services
export const weightService = {
  async getWeightRecords(clientId: string) {
    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('client_id', clientId)
      .order('record_date', { ascending: false });

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      clientId: record.client_id,
      weight: record.weight,
      date: record.record_date,
      notes: record.notes,
    }));
  },

  async addWeightRecord(recordData: any) {
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
  },
};

// Content Services
export const contentService = {
  async getHomeContent() {
    const { data, error } = await supabase
      .from('home_content')
      .select('*')
      .single();

    if (error) throw error;

    return {
      heroTitle: data.hero_title,
      heroSubtitle: data.hero_subtitle,
      heroImage: data.hero_image_url,
      aboutText: data.about_text,
      aboutImage: data.about_image_url,
      servicesTitle: data.services_title,
      services: data.services,
    };
  },

  async updateHomeContent(contentData: any) {
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
      .eq('id', (await supabase.from('home_content').select('id').single()).data?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getContactInfo() {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async updateContactInfo(contactData: any) {
    const { data, error } = await supabase
      .from('contact_info')
      .update(contactData)
      .eq('id', (await supabase.from('contact_info').select('id').single()).data?.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(testimonial => ({
      id: testimonial.id,
      name: testimonial.name,
      content: testimonial.content,
      rating: testimonial.rating,
      avatar: testimonial.avatar_url,
      beforeImage: testimonial.before_image_url,
      afterImage: testimonial.after_image_url,
    }));
  },

  async createTestimonial(testimonialData: any) {
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
  },

  async updateTestimonial(id: string, testimonialData: any) {
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
  },

  async deleteTestimonial(id: string) {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async getVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(video => ({
      id: video.id,
      title: video.title,
      youtubeId: video.youtube_id,
      description: video.description,
      category: video.category,
    }));
  },

  async createVideo(videoData: any) {
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
  },

  async updateVideo(id: string, videoData: any) {
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
  },

  async deleteVideo(id: string) {
    const { error } = await supabase
      .from('videos')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};