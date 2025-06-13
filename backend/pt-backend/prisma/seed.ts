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

  console.log('✅ Admin user created:', admin.email);

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

  console.log('✅ Sample client created:', client.email);

  // Create sample testimonials
  const testimonials = [
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
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: `testimonial-${testimonial.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `testimonial-${testimonial.name.replace(/\s+/g, '-').toLowerCase()}`,
        ...testimonial,
      },
    });
  }

  console.log('✅ Sample testimonials created');

  // Create sample videos
  const videos = [
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
  ];

  for (const video of videos) {
    await prisma.video.upsert({
      where: { id: `video-${video.title.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `video-${video.title.replace(/\s+/g, '-').toLowerCase()}`,
        ...video,
      },
    });
  }

  console.log('✅ Sample videos created');

  // Create contact info
  await prisma.contactInfo.upsert({
    where: { id: 'default-contact' },
    update: {},
    create: {
      id: 'default-contact',
      phone: '0123456789',
      facebookUrl: 'https://facebook.com/phinpt',
      zaloUrl: 'https://zalo.me/0123456789',
      email: 'contact@phinpt.com',
    },
  });

  console.log('✅ Contact info created');

  // Create home content
  await prisma.homeContent.upsert({
    where: { id: 'default-home' },
    update: {},
    create: {
      id: 'default-home',
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

  // Create sample workout plan
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Beginner Workout Plan',
      clientId: client.id,
      trainerId: admin.id,
      weekNumber: 1,
      startDate: new Date(),
      createdBy: 'admin',
      days: {
        create: [
          {
            day: 'Monday',
            isRestDay: false,
            dayOrder: 0,
            exercises: {
              create: [
                {
                  name: 'Push-ups',
                  exerciseOrder: 0,
                  sets: {
                    create: [
                      { setNumber: 1, reps: 10, reality: 10, weight: 0, volume: 0 },
                      { setNumber: 2, reps: 10, reality: 8, weight: 0, volume: 0 },
                      { setNumber: 3, reps: 10, reality: 12, weight: 0, volume: 0 },
                    ],
                  },
                },
              ],
            },
          },
          {
            day: 'Tuesday',
            isRestDay: true,
            dayOrder: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Sample workout plan created');

  // Create sample meal plan
  const mealPlan = await prisma.mealPlan.create({
    data: {
      name: 'Weight Loss Meal Plan',
      clientId: client.i,
      totalCalories: 1500,
      notes: 'Follow this plan for 4 weeks',
      meals: {
        create: [
          {
            name: 'Breakfast',
            totalCalories: 400,
            mealOrder: 0,
            foods: {
              create: [
                {
                  name: 'Oatmeal',
                  macroType: MacroType.CARB,
                  calories: 200,
                  notes: 'With milk',
                  foodOrder: 0,
                },
                {
                  name: 'Banana',
                  macroType: MacroType.CARB,
                  calories: 100,
                  foodOrder: 1,
                },
                {
                  name: 'Almonds',
                  macroType: MacroType.FAT,
                  calories: 100,
                  foodOrder: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Sample meal plan created');

  // Create sample weight records
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7); // Weekly records
    
    await prisma.weightRecord.create({
      data: {
        clientId: client.id,
        weight: 75 - i * 0.5, // Gradual weight loss
        date,
        notes: i === 0 ? 'Feeling great!' : undefined,
      },
    });
  }

  console.log('✅ Sample weight records created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@phinpt.com / admin123');
  console.log('Client: client@example.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });