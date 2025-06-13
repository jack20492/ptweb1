import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async create(createVideoDto: CreateVideoDto) {
    return this.prisma.video.create({
      data: createVideoDto,
    });
  }

  async findAll(page = 1, limit = 10, published?: boolean, category?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (published !== undefined) where.isPublished = published;
    if (category) where.category = category;

    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.video.count({ where }),
    ]);

    return {
      data: videos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublished(category?: string) {
    const where: any = { isPublished: true };
    if (category) where.category = category;

    return this.prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto) {
    await this.findOne(id);

    return this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.video.delete({
      where: { id },
      select: {
        id: true,
        title: true,
        youtubeId: true,
      },
    });
  }

  async getCategories() {
    const categories = await this.prisma.video.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { isPublished: true },
    });

    return categories.map(c => c.category);
  }
}