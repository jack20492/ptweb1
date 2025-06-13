import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
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

  console.log('👑 Admin user created:', admin.username);

  // Create sample client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { username: 'client1' },
    update: {},
    create: {
      username: 'client1',
      email: 'client@example.com',
      password: clientPassword,
      fullName: 'Nguyễn Văn A',
      phone: '0987654321',
      role: UserRole.CLIENT,
    },
  });

  console.log('👤 Client user created:', client.username);

  // Create contact info
  await prisma.contactInfo.upsert({
    where: { id: 'contact-1' },
    update: {},
    create: {
      id: 'contact-1',
      phone: '0123456789',
      facebook: 'https://facebook.com/phinpt',
      zalo: 'https://zalo.me/0123456789',
      email: 'contact@phinpt.com',
    },
  });

  console.log('📞 Contact info created');

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

  console.log('🏠 Home content created');

  // Create sample testimonials
  await prisma.testimonial.createMany({
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
    skipDuplicates: true,
  });

  console.log('💬 Testimonials created');

  // Create sample videos
  await prisma.video.createMany({
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
    skipDuplicates: true,
  });

  console.log('🎥 Videos created');

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });