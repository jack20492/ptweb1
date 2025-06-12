import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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
  addWorkoutPlan: (plan: WorkoutPlan) => void;
  updateWorkoutPlan: (planId: string, updates: Partial<WorkoutPlan>) => void;
  deleteWorkoutPlan: (planId: string) => void;
  addMealPlan: (plan: MealPlan) => void;
  updateMealPlan: (planId: string, updates: Partial<MealPlan>) => void;
  deleteMealPlan: (planId: string) => void;
  addWeightRecord: (record: WeightRecord) => void;
  addTestimonial: (testimonial: Testimonial) => void;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;
  updateContactInfo: (info: ContactInfo) => void;
  updateHomeContent: (content: HomeContent) => void;
  createNewWeekPlan: (clientId: string, templatePlanId: string) => void;
  duplicateWorkoutPlan: (planId: string, assignClientId: string) => void;
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
  const { user, isAdmin } = useAuth();
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
    heroSubtitle:
      "Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness",
    aboutText:
      "Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.",
    servicesTitle: "Dịch vụ của tôi",
    services: [
      "Tư vấn chế độ tập luyện cá nhân",
      "Thiết kế chương trình dinh dưỡng",
      "Theo dõi tiến độ và điều chỉnh",
      "Hỗ trợ 24/7 qua các kênh liên lạc",
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load testimonials
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true);
      
      if (testimonialsData) {
        setTestimonials(testimonialsData.map(t => ({
          id: t.id,
          name: t.name,
          content: t.content,
          rating: t.rating,
          avatar: t.avatar_url || undefined,
          beforeImage: t.before_image_url || undefined,
          afterImage: t.after_image_url || undefined,
        })));
      }

      // Load videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true);
      
      if (videosData) {
        setVideos(videosData.map(v => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtube_id,
          description: v.description,
          category: v.category,
        })));
      }

      // Load home content
      const { data: homeContentData } = await supabase
        .from('home_content')
        .select('*')
        .limit(1)
        .single();
      
      if (homeContentData) {
        setHomeContent({
          heroTitle: homeContentData.hero_title,
          heroSubtitle: homeContentData.hero_subtitle,
          heroImage: homeContentData.hero_image_url || undefined,
          aboutText: homeContentData.about_text,
          aboutImage: homeContentData.about_image_url || undefined,
          servicesTitle: homeContentData.services_title,
          services: homeContentData.services || [],
        });
      }

      // Load contact info
      const { data: contactInfoData } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .single();
      
      if (contactInfoData) {
        setContactInfo({
          phone: contactInfoData.phone,
          facebook: contactInfoData.facebook,
          zalo: contactInfoData.zalo,
          email: contactInfoData.email,
        });
      }

      // Load user-specific data if authenticated
      if (user) {
        // For now, use localStorage for complex data structures
        // TODO: Implement proper database schema for workout plans, meal plans, etc.
        const savedWorkoutPlans = localStorage.getItem("pt_workout_plans");
        if (savedWorkoutPlans) {
          setWorkoutPlans(JSON.parse(savedWorkoutPlans));
        }

        const savedMealPlans = localStorage.getItem("pt_meal_plans");
        if (savedMealPlans) {
          setMealPlans(JSON.parse(savedMealPlans));
        }

        const savedWeightRecords = localStorage.getItem("pt_weight_records");
        if (savedWeightRecords) {
          setWeightRecords(JSON.parse(savedWeightRecords));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addWorkoutPlan = (plan: WorkoutPlan) => {
    const newPlans = [...workoutPlans, plan];
    setWorkoutPlans(newPlans);
    saveToLocalStorage("pt_workout_plans", newPlans);
  };

  const updateWorkoutPlan = (planId: string, updates: Partial<WorkoutPlan>) => {
    const newPlans = workoutPlans.map((plan) =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    setWorkoutPlans(newPlans);
    saveToLocalStorage("pt_workout_plans", newPlans);
  };

  const deleteWorkoutPlan = (planId: string) => {
    const newPlans = workoutPlans.filter((plan) => plan.id !== planId);
    setWorkoutPlans(newPlans);
    saveToLocalStorage("pt_workout_plans", newPlans);
  };

  const duplicateWorkoutPlan = (planId: string, assignClientId: string) => {
    const plan = workoutPlans.find((p) => p.id === planId);
    if (!plan || !assignClientId) return;
    const newPlan: WorkoutPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      clientId: assignClientId,
      weekNumber: 1,
      startDate: new Date().toISOString().split("T")[0],
      createdBy: "admin",
      days: plan.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => ({
          ...ex,
          id: `exercise-${Date.now()}-${Math.random()}`,
          sets: ex.sets.map((set) => ({
            ...set,
            reality: set.reps,
            weight: set.weight || 0,
            volume: set.reps * (set.weight || 0),
          })),
        })),
      })),
    };
    addWorkoutPlan(newPlan);
  };

  const addMealPlan = (plan: MealPlan) => {
    const newPlans = [...mealPlans, plan];
    setMealPlans(newPlans);
    saveToLocalStorage("pt_meal_plans", newPlans);
  };

  const updateMealPlan = (planId: string, updates: Partial<MealPlan>) => {
    const newPlans = mealPlans.map((plan) =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    setMealPlans(newPlans);
    saveToLocalStorage("pt_meal_plans", newPlans);
  };

  const deleteMealPlan = (planId: string) => {
    const newPlans = mealPlans.filter((plan) => plan.id !== planId);
    setMealPlans(newPlans);
    saveToLocalStorage("pt_meal_plans", newPlans);
  };

  const addWeightRecord = (record: WeightRecord) => {
    const newRecords = [...weightRecords, record];
    setWeightRecords(newRecords);
    saveToLocalStorage("pt_weight_records", newRecords);
  };

  const addTestimonial = async (testimonial: Testimonial) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          name: testimonial.name,
          content: testimonial.content,
          rating: testimonial.rating,
          avatar_url: testimonial.avatar,
          before_image_url: testimonial.beforeImage,
          after_image_url: testimonial.afterImage,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTestimonial = {
          id: data.id,
          name: data.name,
          content: data.content,
          rating: data.rating,
          avatar: data.avatar_url || undefined,
          beforeImage: data.before_image_url || undefined,
          afterImage: data.after_image_url || undefined,
        };
        setTestimonials([...testimonials, newTestimonial]);
      }
    } catch (error) {
      console.error('Error adding testimonial:', error);
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          name: updates.name,
          content: updates.content,
          rating: updates.rating,
          avatar_url: updates.avatar,
          before_image_url: updates.beforeImage,
          after_image_url: updates.afterImage,
        })
        .eq('id', id);

      if (error) throw error;

      const newTestimonials = testimonials.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      setTestimonials(newTestimonials);
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const newTestimonials = testimonials.filter((t) => t.id !== id);
      setTestimonials(newTestimonials);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const addVideo = async (video: Video) => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          title: video.title,
          youtube_id: video.youtubeId,
          description: video.description,
          category: video.category,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newVideo = {
          id: data.id,
          title: data.title,
          youtubeId: data.youtube_id,
          description: data.description,
          category: data.category,
        };
        setVideos([...videos, newVideo]);
      }
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: updates.title,
          youtube_id: updates.youtubeId,
          description: updates.description,
          category: updates.category,
        })
        .eq('id', id);

      if (error) throw error;

      const newVideos = videos.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      );
      setVideos(newVideos);
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const newVideos = videos.filter((v) => v.id !== id);
      setVideos(newVideos);
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const updateContactInfo = async (info: ContactInfo) => {
    try {
      const { error } = await supabase
        .from('contact_info')
        .upsert({
          phone: info.phone,
          facebook: info.facebook,
          zalo: info.zalo,
          email: info.email,
        });

      if (error) throw error;

      setContactInfo(info);
    } catch (error) {
      console.error('Error updating contact info:', error);
    }
  };

  const updateHomeContent = async (content: HomeContent) => {
    try {
      const { error } = await supabase
        .from('home_content')
        .upsert({
          hero_title: content.heroTitle,
          hero_subtitle: content.heroSubtitle,
          hero_image_url: content.heroImage,
          about_text: content.aboutText,
          about_image_url: content.aboutImage,
          services_title: content.servicesTitle,
          services: content.services,
        });

      if (error) throw error;

      setHomeContent(content);
    } catch (error) {
      console.error('Error updating home content:', error);
    }
  };

  const createNewWeekPlan = (clientId: string, templatePlanId: string) => {
    const templatePlan = workoutPlans.find((p) => p.id === templatePlanId);
    if (!templatePlan) return;
    const clientPlans = workoutPlans.filter((p) => p.clientId === clientId);
    const newWeekNumber =
      Math.max(...clientPlans.map((p) => p.weekNumber), 0) + 1;
    const newPlan: WorkoutPlan = {
      ...templatePlan,
      id: `${clientId}-week-${newWeekNumber}-${Date.now()}`,
      weekNumber: newWeekNumber,
      startDate: new Date().toISOString().split("T")[0],
      days: templatePlan.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          id: `exercise-${Date.now()}-${Math.random()}`,
          sets: exercise.sets.map((set) => ({
            ...set,
            reality: set.reps,
            weight: set.weight || 0,
            volume: set.reps * (set.weight || 0),
          })),
        })),
      })),
      createdBy: "client",
    };
    addWorkoutPlan(newPlan);
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};