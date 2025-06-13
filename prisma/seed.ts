import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@phinpt.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@phinpt.com',
      password: hashedAdminPassword,
      fullName: 'Phi Nguyễn PT',
      phone: '0123456789',
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample client
  const hashedClientPassword = await bcrypt.hash('client123', 12);
  
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      username: 'client1',
      email: 'client@example.com',
      password: hashedClientPassword,
      fullName: 'Nguyễn Văn A',
      phone: '0987654321',
      role: UserRole.CLIENT,
    },
  });

  console.log('✅ Sample client created:', client.email);

  // Create contact info
  await prisma.contactInfo.upsert({
    where: { id: 'contact-1' },
    update: {},
    create: {
      id: 'contact-1',
      phone: '0123456789',
      facebookUrl: 'https://facebook.com/phinpt',
      zaloUrl: 'https://zalo.me/0123456789',
      email: 'contact@phinpt.com',
    },
  });

  console.log('✅ Contact info created');

  // Create home content
  await prisma.homeContent.upsert({
    where: { id: 'home-1' },
    update: {},
    create: {
      id: 'home-1',
      heroTitle: 'Phi Nguyễn Personal Trainer',
      heroSubtitle: 'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness',
      aboutText: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness, tôi cam kết mang đến cho bạn chương trình tập luyện hiệu quả và phù hợp nhất.',
      servicesTitle: 'Dịch vụ của tôi',
      services: [
        'Tư vấn chế độ tập luyện cá nhân',
        'Thiết kế chương trình dinh dưỡng',
        'Theo dõi tiến độ và điều chỉnh',
        'Hỗ trợ 24/7 qua các kênh liên lạc'
      ],
    },
  });

  console.log('✅ Home content created');

  // Create sample testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        name: 'Nguyễn Minh Anh',
        content: 'Sau 3 tháng tập với PT Phi, tôi đã giảm được 8kg và cảm thấy khỏe khoắn hơn rất nhiều. Chương trình tập rất khoa học và phù hợp.',
        rating: 5,
        isPublished: true,
      },
      {
        name: 'Trần Văn Đức',
        content: 'PT Phi rất nhiệt tình và chuyên nghiệp. Nhờ có sự hướng dẫn tận tình, tôi đã tăng được 5kg cơ trong 4 tháng.',
        rating: 5,
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Sample testimonials created');

  // Create sample videos
  await prisma.video.createMany({
    data: [
      {
        title: 'Bài tập cardio cơ bản tại nhà',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Hướng dẫn các bài tập cardio đơn giản có thể thực hiện tại nhà',
        category: 'Cardio',
        isPublished: true,
      },
      {
        title: 'Tập ngực cho người mới bắt đầu',
        youtubeId: 'dQw4w9WgXcQ',
        description: 'Các bài tập phát triển cơ ngực hiệu quả dành cho newbie',
        category: 'Strength',
        isPublished: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Sample videos created');

  // Create sample workout plan
  const workoutPlan = await prisma.workoutPlan.create({
    data: {
      name: 'Kế hoạch tăng cơ tuần 1',
      clientId: client.id,
      weekNumber: 1,
      startDate: new Date(),
      createdBy: admin.id,
      exercises: {
        create: [
          {
            dayName: 'Thứ 2',
            isRestDay: false,
            exerciseName: 'Push-up',
            exerciseOrder: 0,
            sets: {
              create: [
                { setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 0, volume: 0 },
                { setNumber: 2, targetReps: 10, actualReps: 10, weightKg: 0, volume: 0 },
                { setNumber: 3, targetReps: 10, actualReps: 10, weightKg: 0, volume: 0 },
              ],
            },
          },
          {
            dayName: 'Thứ 3',
            isRestDay: true,
            exerciseOrder: 1,
          },
          {
            dayName: 'Thứ 4',
            isRestDay: false,
            exerciseName: 'Squat',
            exerciseOrder: 2,
            sets: {
              create: [
                { setNumber: 1, targetReps: 15, actualReps: 15, weightKg: 0, volume: 0 },
                { setNumber: 2, targetReps: 15, actualReps: 15, weightKg: 0, volume: 0 },
                { setNumber: 3, targetReps: 15, actualReps: 15, weightKg: 0, volume: 0 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Sample workout plan created');

  // Create sample meal plan
  const mealPlan = await prisma.mealPlan.create({
    data: {
      name: 'Kế hoạch dinh dưỡng giảm cân',
      clientId: client.id,
      totalCalories: 1500,
      notes: 'Uống nhiều nước, ăn chậm',
      meals: {
        create: [
          {
            name: 'Bữa sáng',
            totalCalories: 400,
            mealOrder: 0,
            foods: {
              create: [
                {
                  name: 'Yến mạch',
                  macroType: 'CARB',
                  calories: 150,
                  foodOrder: 0,
                },
                {
                  name: 'Trứng luộc',
                  macroType: 'PRO',
                  calories: 150,
                  foodOrder: 1,
                },
                {
                  name: 'Chuối',
                  macroType: 'CARB',
                  calories: 100,
                  foodOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Bữa trưa',
            totalCalories: 600,
            mealOrder: 1,
            foods: {
              create: [
                {
                  name: 'Cơm gạo lứt',
                  macroType: 'CARB',
                  calories: 200,
                  foodOrder: 0,
                },
                {
                  name: 'Thịt gà luộc',
                  macroType: 'PRO',
                  calories: 250,
                  foodOrder: 1,
                },
                {
                  name: 'Rau xanh',
                  macroType: 'CARB',
                  calories: 150,
                  foodOrder: 2,
                },
              ],
            },
          },
          {
            name: 'Bữa tối',
            totalCalories: 500,
            mealOrder: 2,
            foods: {
              create: [
                {
                  name: 'Cá hồi nướng',
                  macroType: 'PRO',
                  calories: 300,
                  foodOrder: 0,
                },
                {
                  name: 'Salad',
                  macroType: 'CARB',
                  calories: 100,
                  foodOrder: 1,
                },
                {
                  name: 'Dầu olive',
                  macroType: 'FAT',
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
  await prisma.weightRecord.createMany({
    data: [
      {
        clientId: client.id,
        weightKg: 75.0,
        recordDate: new Date('2024-01-01'),
        notes: 'Cân nặng ban đầu',
      },
      {
        clientId: client.id,
        weightKg: 74.5,
        recordDate: new Date('2024-01-08'),
        notes: 'Sau 1 tuần tập',
      },
      {
        clientId: client.id,
        weightKg: 73.8,
        recordDate: new Date('2024-01-15'),
        notes: 'Sau 2 tuần tập',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Sample weight records created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Default accounts:');
  console.log('👑 Admin: admin / admin123');
  console.log('👤 Client: client1 / client123');
  console.log('');
  console.log('🔗 You can now start the server with: npm run start:dev');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });