import { PrismaClient, UserRole, MacroType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@phinpt.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@phinpt.com',
      password: hashedPassword,
      fullName: 'Phi Nguyễn PT',
      phone: '0123456789',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin.username);

  // Create sample client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      username: 'client_demo',
      email: 'client@example.com',
      password: clientPassword,
      fullName: 'Nguyễn Văn A',
      phone: '0987654321',
      role: UserRole.CLIENT,
    },
  });

  console.log('✅ Sample client created:', client.username);

  // Create sample workout plan
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Beginner Workout Plan',
      clientId: client.id,
      weekNumber: 1,
      createdBy: admin.id,
      days: {
        create: [
          {
            day: 'Monday',
            isRestDay: false,
            exercises: {
              create: [
                {
                  name: 'Push-ups',
                  sets: {
                    create: [
                      { setNumber: 1, reps: 10, reality: 10, weight: 0, volume: 0 },
                      { setNumber: 2, reps: 10, reality: 8, weight: 0, volume: 0 },
                      { setNumber: 3, reps: 10, reality: 12, weight: 0, volume: 0 },
                    ],
                  },
                },
                {
                  name: 'Squats',
                  sets: {
                    create: [
                      { setNumber: 1, reps: 15, reality: 15, weight: 0, volume: 0 },
                      { setNumber: 2, reps: 15, reality: 12, weight: 0, volume: 0 },
                      { setNumber: 3, reps: 15, reality: 18, weight: 0, volume: 0 },
                    ],
                  },
                },
              ],
            },
          },
          {
            day: 'Tuesday',
            isRestDay: true,
          },
          {
            day: 'Wednesday',
            isRestDay: false,
            exercises: {
              create: [
                {
                  name: 'Plank',
                  sets: {
                    create: [
                      { setNumber: 1, reps: 30, reality: 30, weight: 0, volume: 0 },
                      { setNumber: 2, reps: 30, reality: 25, weight: 0, volume: 0 },
                      { setNumber: 3, reps: 30, reality: 35, weight: 0, volume: 0 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Sample workout plan created:', workoutPlan.name);

  // Create sample meal plan
  const mealPlan = await prisma.mealPlan.create({
    data: {
      name: 'Weight Loss Meal Plan',
      clientId: client.id,
      totalCalories: 1500,
      notes: 'Low carb, high protein diet for weight loss',
      meals: {
        create: [
          {
            name: 'Breakfast',
            totalCalories: 400,
            foods: {
              create: [
                {
                  name: 'Oatmeal',
                  macroType: MacroType.CARB,
                  calories: 200,
                  notes: 'With berries',
                },
                {
                  name: 'Greek Yogurt',
                  macroType: MacroType.PRO,
                  calories: 150,
                  notes: 'Plain, low-fat',
                },
                {
                  name: 'Almonds',
                  macroType: MacroType.FAT,
                  calories: 50,
                  notes: '10 pieces',
                },
              ],
            },
          },
          {
            name: 'Lunch',
            totalCalories: 500,
            foods: {
              create: [
                {
                  name: 'Grilled Chicken',
                  macroType: MacroType.PRO,
                  calories: 300,
                  notes: '150g breast',
                },
                {
                  name: 'Brown Rice',
                  macroType: MacroType.CARB,
                  calories: 150,
                  notes: '1/2 cup cooked',
                },
                {
                  name: 'Mixed Vegetables',
                  macroType: MacroType.CARB,
                  calories: 50,
                  notes: 'Steamed',
                },
              ],
            },
          },
          {
            name: 'Dinner',
            totalCalories: 600,
            foods: {
              create: [
                {
                  name: 'Salmon',
                  macroType: MacroType.PRO,
                  calories: 350,
                  notes: '200g fillet',
                },
                {
                  name: 'Sweet Potato',
                  macroType: MacroType.CARB,
                  calories: 150,
                  notes: 'Medium sized, baked',
                },
                {
                  name: 'Avocado',
                  macroType: MacroType.FAT,
                  calories: 100,
                  notes: '1/2 medium',
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Sample meal plan created:', mealPlan.name);

  // Create sample weight records
  const weightRecords = await prisma.weightRecord.createMany({
    data: [
      {
        clientId: client.id,
        weight: 75.5,
        date: new Date('2024-01-01'),
        notes: 'Starting weight',
      },
      {
        clientId: client.id,
        weight: 74.8,
        date: new Date('2024-01-08'),
        notes: 'Week 1 progress',
      },
      {
        clientId: client.id,
        weight: 74.2,
        date: new Date('2024-01-15'),
        notes: 'Week 2 progress',
      },
    ],
  });

  console.log('✅ Sample weight records created');

  // Create sample testimonials
  const testimonials = await prisma.testimonial.createMany({
    data: [
      {
        name: 'Nguyễn Minh Anh',
        content: 'Sau 3 tháng tập với PT Phi, tôi đã giảm được 8kg và cảm thấy khỏe khoắn hơn rất nhiều. Chương trình tập rất khoa học và phù hợp.',
        rating: 5,
      },
      {
        name: 'Trần Văn Đức',
        content: 'PT Phi rất nhiệt tình và chuyên nghiệp. Nhờ có sự hướng dẫn tận tình, tôi đã tăng được 5kg cơ trong 4 tháng.',
        rating: 5,
      },
    ],
  });

  console.log('✅ Sample testimonials created');

  // Create sample videos
  const videos = await prisma.video.createMany({
    data: [
      {
        title: 'Bài tập cardio cơ bản tại nhà',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Hướng dẫn các bài tập cardio đơn giản có thể thực hiện tại nhà',
        category: 'Cardio',
      },
      {
        title: 'Tập ngực cho người mới bắt đầu',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Các bài tập phát triển cơ ngực hiệu quả dành cho newbie',
        category: 'Strength',
      },
    ],
  });

  console.log('✅ Sample videos created');

  // Create contact info
  const contactInfo = await prisma.contactInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      phone: '0123456789',
      facebook: 'https://facebook.com/phinpt',
      zalo: 'https://zalo.me/0123456789',
      email: 'contact@phinpt.com',
    },
  });

  console.log('✅ Contact info created');

  // Create home content
  const homeContent = await prisma.homeContent.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroTitle: 'Phi Nguyễn Personal Trainer',
      heroSubtitle: 'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness',
      aboutText: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.',
      servicesTitle: 'Dịch vụ của tôi',
      services: [
        'Tư vấn chế độ tập luyện cá nhân',
        'Thiết kế chương trình dinh dưỡng',
        'Theo dõi tiến độ và điều chỉnh',
        'Hỗ trợ 24/7 qua các kênh liên lạc',
      ],
    },
  });

  console.log('✅ Home content created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });