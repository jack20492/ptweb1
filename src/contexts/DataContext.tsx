import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "./AuthContext";
import type {
  WorkoutPlan as SupabaseWorkoutPlan,
  Exercise as SupabaseExercise,
  ExerciseSet as SupabaseExerciseSet,
  MealPlan as SupabaseMealPlan,
  Meal as SupabaseMeal,
  MealFood as SupabaseMealFood,
  WeightRecord as SupabaseWeightRecord,
  Testimonial as SupabaseTestimonial,
  Video as SupabaseVideo,
  ContactInfo as SupabaseContactInfo,
  HomeContent as SupabaseHomeContent,
} from "../lib/supabase";

// Legacy interfaces for compatibility with existing components
interface Exercise {
  id: string;
  name: string;
  sets: {
    set: number;
    reps: number;
    reality?: number;
    weight?: number;
    volume?: number;
  }[];
}

interface DayWorkout {
  day: string;
  isRestDay: boolean;
  exercises: Exercise[];
}

interface WorkoutPlan {
  id: string;
  name: string;
  clientId: string;
  weekNumber: number;
  startDate: string;
  days: DayWorkout[];
  createdBy?: "admin" | "client";
}

interface FoodItem {
  name: string;
  macroType: "Carb" | "Pro" | "Fat";
  calories: number;
  notes: string;
}

interface MealPlan {
  id: string;
  name: string;
  clientId: string;
  meals: {
    name: string;
    totalCalories: number;
    foods: FoodItem[];
  }[];
  totalCalories: number;
  notes?: string;
}

interface WeightRecord {
  id: string;
  clientId: string;
  weight: number;
  date: string;
  notes?: string;
}

interface Testimonial {
  id: string;
  name: string;
  content: string;
  avatar?: string;
  rating: number;
  beforeImage?: string;
  afterImage?: string;
}

interface Video {
  id: string;
  title: string;
  youtubeId: string;
  description: string;
  category: string;
}

interface ContactInfo {
  phone: string;
  facebook: string;
  zalo: string;
  email: string;
}

interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  aboutText: string;
  aboutImage?: string;
  servicesTitle: string;
  services: string[];
}

interface DataContextType {
  workoutPlans: WorkoutPlan[];
  mealPlans: MealPlan[];
  weightRecords: WeightRecord[];
  testimonials: Testimonial[];
  videos: Video[];
  contactInfo: ContactInfo;
  homeContent: HomeContent;
  loading: boolean;
  error: string | null;
  addWorkoutPlan: (plan: WorkoutPlan) => Promise<void>;
  updateWorkoutPlan: (planId: string, updates: Partial<WorkoutPlan>) => Promise<void>;
  deleteWorkoutPlan: (planId: string) => Promise<void>;
  addMealPlan: (plan: MealPlan) => Promise<void>;
  updateMealPlan: (planId: string, updates: Partial<MealPlan>) => Promise<void>;
  deleteMealPlan: (planId: string) => Promise<void>;
  addWeightRecord: (record: WeightRecord) => Promise<void>;
  addTestimonial: (testimonial: Testimonial) => Promise<void>;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  addVideo: (video: Video) => Promise<void>;
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  updateContactInfo: (info: ContactInfo) => Promise<void>;
  updateHomeContent: (content: HomeContent) => Promise<void>;
  createNewWeekPlan: (clientId: string, templatePlanId: string) => Promise<void>;
  duplicateWorkoutPlan: (planId: string, assignClientId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const supabaseHooks = useSupabase();
  
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "0123456789",
    facebook: "https://facebook.com/phinpt",
    zalo: "https://zalo.me/0123456789",
    email: "contact@phinpt.com",
  });
  const [homeContent, setHomeContent] = useState<HomeContent>({
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
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform Supabase data to legacy format
  const transformWorkoutPlan = (supabasePlan: SupabaseWorkoutPlan): WorkoutPlan => {
    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    
    // Group exercises by day
    const exercisesByDay = (supabasePlan.exercises || []).reduce((acc, exercise) => {
      if (!acc[exercise.day_name]) {
        acc[exercise.day_name] = [];
      }
      acc[exercise.day_name].push(exercise);
      return acc;
    }, {} as Record<string, SupabaseExercise[]>);

    const days: DayWorkout[] = dayNames.map(dayName => {
      const dayExercises = exercisesByDay[dayName] || [];
      const isRestDay = dayExercises.length === 0 || dayExercises.every(ex => ex.is_rest_day);
      
      return {
        day: dayName,
        isRestDay,
        exercises: dayExercises
          .filter(ex => !ex.is_rest_day && ex.exercise_name)
          .map(ex => ({
            id: ex.id,
            name: ex.exercise_name || '',
            sets: (ex.exercise_sets || []).map(set => ({
              set: set.set_number,
              reps: set.target_reps,
              reality: set.actual_reps,
              weight: Number(set.weight_kg),
              volume: Number(set.volume),
            }))
          }))
      };
    });

    return {
      id: supabasePlan.id,
      name: supabasePlan.name,
      clientId: supabasePlan.client_id,
      weekNumber: supabasePlan.week_number,
      startDate: supabasePlan.start_date,
      days,
      createdBy: supabasePlan.created_by as "admin" | "client" | undefined,
    };
  };

  const transformMealPlan = (supabasePlan: SupabaseMealPlan): MealPlan => {
    return {
      id: supabasePlan.id,
      name: supabasePlan.name,
      clientId: supabasePlan.client_id,
      totalCalories: supabasePlan.total_calories,
      notes: supabasePlan.notes,
      meals: (supabasePlan.meals || []).map(meal => ({
        name: meal.name,
        totalCalories: meal.total_calories,
        foods: (meal.meal_foods || []).map(food => ({
          name: food.name,
          macroType: food.macro_type,
          calories: food.calories,
          notes: food.notes || '',
        }))
      }))
    };
  };

  const transformWeightRecord = (supabaseRecord: SupabaseWeightRecord): WeightRecord => {
    return {
      id: supabaseRecord.id,
      clientId: supabaseRecord.client_id,
      weight: Number(supabaseRecord.weight_kg),
      date: supabaseRecord.record_date,
      notes: supabaseRecord.notes,
    };
  };

  const transformTestimonial = (supabaseTestimonial: SupabaseTestimonial): Testimonial => {
    return {
      id: supabaseTestimonial.id,
      name: supabaseTestimonial.name,
      content: supabaseTestimonial.content,
      rating: supabaseTestimonial.rating,
      avatar: supabaseTestimonial.avatar_url,
      beforeImage: supabaseTestimonial.before_image_url,
      afterImage: supabaseTestimonial.after_image_url,
    };
  };

  const transformVideo = (supabaseVideo: SupabaseVideo): Video => {
    return {
      id: supabaseVideo.id,
      title: supabaseVideo.title,
      youtubeId: supabaseVideo.youtube_id,
      description: supabaseVideo.description,
      category: supabaseVideo.category,
    };
  };

  const transformContactInfo = (supabaseContact: SupabaseContactInfo): ContactInfo => {
    return {
      phone: supabaseContact.phone,
      facebook: supabaseContact.facebook_url,
      zalo: supabaseContact.zalo_url,
      email: supabaseContact.email,
    };
  };

  const transformHomeContent = (supabaseContent: SupabaseHomeContent): HomeContent => {
    return {
      heroTitle: supabaseContent.hero_title,
      heroSubtitle: supabaseContent.hero_subtitle,
      heroImage: supabaseContent.hero_image_url,
      aboutText: supabaseContent.about_text,
      aboutImage: supabaseContent.about_image_url,
      servicesTitle: supabaseContent.services_title,
      services: supabaseContent.services,
    };
  };

  // Load data from Supabase
  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load workout plans
      const supabaseWorkoutPlans = await supabaseHooks.getWorkoutPlans();
      setWorkoutPlans(supabaseWorkoutPlans.map(transformWorkoutPlan));

      // Load meal plans
      const supabaseMealPlans = await supabaseHooks.getMealPlans();
      setMealPlans(supabaseMealPlans.map(transformMealPlan));

      // Load weight records
      const supabaseWeightRecords = await supabaseHooks.getWeightRecords();
      setWeightRecords(supabaseWeightRecords.map(transformWeightRecord));

      // Load testimonials
      const supabaseTestimonials = await supabaseHooks.getTestimonials();
      setTestimonials(supabaseTestimonials.map(transformTestimonial));

      // Load videos
      const supabaseVideos = await supabaseHooks.getVideos();
      setVideos(supabaseVideos.map(transformVideo));

      // Load contact info
      const supabaseContactInfo = await supabaseHooks.getContactInfo();
      if (supabaseContactInfo) {
        setContactInfo(transformContactInfo(supabaseContactInfo));
      }

      // Load home content
      const supabaseHomeContent = await supabaseHooks.getHomeContent();
      if (supabaseHomeContent) {
        setHomeContent(transformHomeContent(supabaseHomeContent));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  // Workout plan functions
  const addWorkoutPlan = async (plan: WorkoutPlan) => {
    try {
      // Create workout plan
      const workoutPlan = await supabaseHooks.createWorkoutPlan({
        name: plan.name,
        client_id: plan.clientId,
        week_number: plan.weekNumber,
        start_date: plan.startDate,
        created_by: user?.id,
      });

      if (!workoutPlan) throw new Error('Failed to create workout plan');

      // Create exercises and sets
      for (const [dayIndex, day] of plan.days.entries()) {
        for (const [exerciseIndex, exercise] of day.exercises.entries()) {
          const exerciseRecord = await supabaseHooks.createExercise({
            workout_plan_id: workoutPlan.id,
            day_name: day.day,
            is_rest_day: day.isRestDay,
            exercise_name: exercise.name,
            exercise_order: exerciseIndex,
          });

          if (exerciseRecord) {
            for (const set of exercise.sets) {
              await supabaseHooks.createExerciseSet({
                exercise_id: exerciseRecord.id,
                set_number: set.set,
                target_reps: set.reps,
                actual_reps: set.reality,
                weight_kg: set.weight,
                volume: set.volume,
              });
            }
          }
        }
      }

      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add workout plan');
    }
  };

  const updateWorkoutPlan = async (planId: string, updates: Partial<WorkoutPlan>) => {
    try {
      await supabaseHooks.updateWorkoutPlan(planId, {
        name: updates.name,
        week_number: updates.weekNumber,
        start_date: updates.startDate,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workout plan');
    }
  };

  const deleteWorkoutPlan = async (planId: string) => {
    try {
      await supabaseHooks.deleteWorkoutPlan(planId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout plan');
    }
  };

  const duplicateWorkoutPlan = async (planId: string, assignClientId: string) => {
    const plan = workoutPlans.find(p => p.id === planId);
    if (!plan) return;

    const newPlan: WorkoutPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      clientId: assignClientId,
      weekNumber: 1,
      startDate: new Date().toISOString().split('T')[0],
      createdBy: 'admin',
    };

    await addWorkoutPlan(newPlan);
  };

  const createNewWeekPlan = async (clientId: string, templatePlanId: string) => {
    const templatePlan = workoutPlans.find(p => p.id === templatePlanId);
    if (!templatePlan) return;

    const clientPlans = workoutPlans.filter(p => p.clientId === clientId);
    const newWeekNumber = Math.max(...clientPlans.map(p => p.weekNumber), 0) + 1;

    const newPlan: WorkoutPlan = {
      ...templatePlan,
      id: `${clientId}-week-${newWeekNumber}-${Date.now()}`,
      weekNumber: newWeekNumber,
      startDate: new Date().toISOString().split('T')[0],
      createdBy: 'client',
    };

    await addWorkoutPlan(newPlan);
  };

  // Meal plan functions
  const addMealPlan = async (plan: MealPlan) => {
    try {
      // Create meal plan
      const mealPlan = await supabaseHooks.createMealPlan({
        name: plan.name,
        client_id: plan.clientId,
        total_calories: plan.totalCalories,
        notes: plan.notes,
      });

      if (!mealPlan) throw new Error('Failed to create meal plan');

      // Create meals and foods
      for (const [mealIndex, meal] of plan.meals.entries()) {
        const mealRecord = await supabaseHooks.createMeal({
          meal_plan_id: mealPlan.id,
          name: meal.name,
          total_calories: meal.totalCalories,
          meal_order: mealIndex,
        });

        if (mealRecord) {
          for (const [foodIndex, food] of meal.foods.entries()) {
            await supabaseHooks.createMealFood({
              meal_id: mealRecord.id,
              name: food.name,
              macro_type: food.macroType,
              calories: food.calories,
              notes: food.notes,
              food_order: foodIndex,
            });
          }
        }
      }

      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add meal plan');
    }
  };

  const updateMealPlan = async (planId: string, updates: Partial<MealPlan>) => {
    try {
      await supabaseHooks.updateMealPlan(planId, {
        name: updates.name,
        total_calories: updates.totalCalories,
        notes: updates.notes,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meal plan');
    }
  };

  const deleteMealPlan = async (planId: string) => {
    try {
      await supabaseHooks.deleteMealPlan(planId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meal plan');
    }
  };

  // Weight record functions
  const addWeightRecord = async (record: WeightRecord) => {
    try {
      await supabaseHooks.createWeightRecord({
        client_id: record.clientId,
        weight_kg: record.weight,
        record_date: record.date,
        notes: record.notes,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add weight record');
    }
  };

  // Testimonial functions
  const addTestimonial = async (testimonial: Testimonial) => {
    try {
      await supabaseHooks.createTestimonial({
        name: testimonial.name,
        content: testimonial.content,
        rating: testimonial.rating,
        avatar_url: testimonial.avatar,
        before_image_url: testimonial.beforeImage,
        after_image_url: testimonial.afterImage,
        is_published: true,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add testimonial');
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      await supabaseHooks.updateTestimonial(id, {
        name: updates.name,
        content: updates.content,
        rating: updates.rating,
        avatar_url: updates.avatar,
        before_image_url: updates.beforeImage,
        after_image_url: updates.afterImage,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update testimonial');
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await supabaseHooks.deleteTestimonial(id);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete testimonial');
    }
  };

  // Video functions
  const addVideo = async (video: Video) => {
    try {
      await supabaseHooks.createVideo({
        title: video.title,
        youtube_id: video.youtubeId,
        description: video.description,
        category: video.category,
        is_published: true,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video');
    }
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      await supabaseHooks.updateVideo(id, {
        title: updates.title,
        youtube_id: updates.youtubeId,
        description: updates.description,
        category: updates.category,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video');
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      await supabaseHooks.deleteVideo(id);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  // Contact info functions
  const updateContactInfo = async (info: ContactInfo) => {
    try {
      await supabaseHooks.updateContactInfo({
        phone: info.phone,
        facebook_url: info.facebook,
        zalo_url: info.zalo,
        email: info.email,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact info');
    }
  };

  // Home content functions
  const updateHomeContent = async (content: HomeContent) => {
    try {
      await supabaseHooks.updateHomeContent({
        hero_title: content.heroTitle,
        hero_subtitle: content.heroSubtitle,
        hero_image_url: content.heroImage,
        about_text: content.aboutText,
        about_image_url: content.aboutImage,
        services_title: content.servicesTitle,
        services: content.services,
      });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update home content');
    }
  };

  return (
    <DataContext.Provider
      value={{
        workoutPlans,
        mealPlans,
        weightRecords,
        testimonials,
        videos,
        contactInfo,
        homeContent,
        loading,
        error,
        addWorkoutPlan,
        updateWorkoutPlan,
        deleteWorkoutPlan,
        addMealPlan,
        updateMealPlan,
        deleteMealPlan,
        addWeightRecord,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        addVideo,
        updateVideo,
        deleteVideo,
        updateContactInfo,
        updateHomeContent,
        createNewWeekPlan,
        duplicateWorkoutPlan,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};