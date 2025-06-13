import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(createVideoDto: CreateVideoDto, userRole: UserRole) {
    // Only admins can create videos
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể tạo video');
    }

    return this.prisma.video.create({
      data: createVideoDto,
    });
  }

  async findAll(userRole?: UserRole) {
    // Public endpoint - only show published videos for non-admins
    const where = userRole === UserRole.ADMIN 
      ? {} 
      : { isPublished: true };

    return this.prisma.video.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCategory(category: string, userRole?: UserRole) {
    const where = userRole === UserRole.ADMIN 
      ? { category } 
      : { category, isPublished: true };

    return this.prisma.video.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Không tìm thấy video');
    }

    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto, userRole: UserRole) {
    // Only admins can update videos
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể cập nhật video');
    }

    const video = await this.findOne(id);

    return this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  async remove(id: string, userRole: UserRole) {
    // Only admins can delete videos
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể xóa video');
    }

    const video = await this.findOne(id);

    return this.prisma.video.delete({
      where: { id },
    });
  }

  async togglePublish(id: string, userRole: UserRole) {
    // Only admins can toggle publish status
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể thay đổi trạng thái xuất bản');
    }

    const video = await this.findOne(id);

    return this.prisma.video.update({
      where: { id },
      data: {
        isPublished: !video.isPublished,
      },
    });
  }

  async getCategories() {
    const categories = await this.prisma.video.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        isPublished: true,
      },
    });

    return categories.map(item => item.category);
  }
}