import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHomeContentDto } from './dto/create-home-content.dto';
import { UpdateHomeContentDto } from './dto/update-home-content.dto';

@Injectable()
export class HomeContentService {
  constructor(private prisma: PrismaService) {}

  async create(createHomeContentDto: CreateHomeContentDto) {
    return this.prisma.homeContent.create({
      data: createHomeContentDto,
    });
  }

  async findAll() {
    return this.prisma.homeContent.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findCurrent() {
    const homeContent = await this.prisma.homeContent.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!homeContent) {
      // Create default home content if none exists
      return this.create({
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
      });
    }

    return homeContent;
  }

  async findOne(id: string) {
    const homeContent = await this.prisma.homeContent.findUnique({
      where: { id },
    });

    if (!homeContent) {
      throw new NotFoundException('Home content not found');
    }

    return homeContent;
  }

  async update(id: string, updateHomeContentDto: UpdateHomeContentDto) {
    await this.findOne(id);

    return this.prisma.homeContent.update({
      where: { id },
      data: updateHomeContentDto,
    });
  }

  async updateCurrent(updateHomeContentDto: UpdateHomeContentDto) {
    const current = await this.findCurrent();
    return this.update(current.id, updateHomeContentDto);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.homeContent.delete({
      where: { id },
      select: {
        id: true,
        heroTitle: true,
        heroSubtitle: true,
      },
    });
  }
}