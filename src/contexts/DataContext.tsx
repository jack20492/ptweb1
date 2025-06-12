import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from './AuthContext';
import {
  workoutService,
  mealPlanService,
  weightService,
  contentService,
} from '../services/api';

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
    if (user) {
      loadData();
    } else {
      // Load public data even when not logged in
      loadPublicData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadWorkoutPlans(),
        loadMealPlans(),
        loadWeightRecords(),
        loadPublicData(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPublicData = async () => {
    try {
      const [homeData, contactData, testimonialsData, videosData] = await Promise.all([
        contentService.getHomeContent(),
        contentService.getContactInfo(),
        contentService.getTestimonials(),
        contentService.getVideos(),
      ]);

      setHomeContent(homeData);
      setContactInfo(contactData);
      setTestimonials(testimonialsData);
      setVideos(videosData);
    } catch (error) {
      console.error('Error loading public data:', error);
    } finally {
      if (!user) {
        setLoading(false);
      }
    }
  };

  const loadWorkoutPlans = async () => {
    try {
      const plans = await workoutService.getWorkoutPlans(
        isAdmin ? undefined : user?.id
      );
      setWorkoutPlans(plans);
    } catch (error) {
      console.error('Error loading workout plans:', error);
    }
  };

  const loadMealPlans = async () => {
    try {
      const plans = await mealPlanService.getMealPlans(
        isAdmin ? undefined : user?.id
      );
      setMealPlans(plans);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  const loadWeightRecords = async () => {
    if (!user) return;
    
    try {
      const records = await weightService.getWeightRecords(user.id);
      setWeightRecords(records);
    } catch (error) {
      console.error('Error loading weight records:', error);
    }
  };

  const addWorkoutPlan = async (plan: WorkoutPlan) => {
    try {
      await workoutService.createWorkoutPlan(plan);
      await loadWorkoutPlans();
    } catch (error) {
      console.error('Error adding workout plan:', error);
      throw error;
    }
  };

  const updateWorkoutPlan = async (planId: string, updates: Partial<WorkoutPlan>) => {
    try {
      await workoutService.updateWorkoutPlan(planId, updates);
      await loadWorkoutPlans();
    } catch (error) {
      console.error('Error updating workout plan:', error);
      throw error;
    }
  };

  const deleteWorkoutPlan = async (planId: string) => {
    try {
      await workoutService.deleteWorkoutPlan(planId);
      await loadWorkoutPlans();
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      throw error;
    }
  };

  const duplicateWorkoutPlan = async (planId: string, assignClientId: string) => {
    try {
      await workoutService.duplicateWorkoutPlan(planId, assignClientId);
      await loadWorkoutPlans();
    } catch (error) {
      console.error('Error duplicating workout plan:', error);
      throw error;
    }
  };

  const addMealPlan = async (plan: MealPlan) => {
    try {
      await mealPlanService.createMealPlan(plan);
      await loadMealPlans();
    } catch (error) {
      console.error('Error adding meal plan:', error);
      throw error;
    }
  };

  const updateMealPlan = async (planId: string, updates: Partial<MealPlan>) => {
    try {
      await mealPlanService.updateMealPlan(planId, updates);
      await loadMealPlans();
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  };

  const deleteMealPlan = async (planId: string) => {
    try {
      await mealPlanService.deleteMealPlan(planId);
      await loadMealPlans();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  };

  const addWeightRecord = async (record: WeightRecord) => {
    try {
      await weightService.addWeightRecord(record);
      await loadWeightRecords();
    } catch (error) {
      console.error('Error adding weight record:', error);
      throw error;
    }
  };

  const addTestimonial = async (testimonial: Testimonial) => {
    try {
      await contentService.createTestimonial(testimonial);
      await loadPublicData();
    } catch (error) {
      console.error('Error adding testimonial:', error);
      throw error;
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    try {
      await contentService.updateTestimonial(id, updates);
      await loadPublicData();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await contentService.deleteTestimonial(id);
      await loadPublicData();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  };

  const addVideo = async (video: Video) => {
    try {
      await contentService.createVideo(video);
      await loadPublicData();
    } catch (error) {
      console.error('Error adding video:', error);
      throw error;
    }
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      await contentService.updateVideo(id, updates);
      await loadPublicData();
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      await contentService.deleteVideo(id);
      await loadPublicData();
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

  const updateContactInfo = async (info: ContactInfo) => {
    try {
      await contentService.updateContactInfo(info);
      setContactInfo(info);
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  };

  const updateHomeContent = async (content: HomeContent) => {
    try {
      await contentService.updateHomeContent(content);
      setHomeContent(content);
    } catch (error) {
      console.error('Error updating home content:', error);
      throw error;
    }
  };

  const createNewWeekPlan = async (clientId: string, templatePlanId: string) => {
    try {
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
        createdBy: "client",
      };

      await addWorkoutPlan(newPlan);
    } catch (error) {
      console.error('Error creating new week plan:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await loadData();
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
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};