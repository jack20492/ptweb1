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

  async findAll() {
    return this.prisma.video.findMany({
      where: { isPublished: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.video.findMany({
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
      throw new NotFoundException('Video not found');
    }

    return video;
  }

  async findByCategory(category: string) {
    return this.prisma.video.findMany({
      where: { 
        category,
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateVideoDto: UpdateVideoDto) {
    try {
      return await this.prisma.video.update({
        where: { id },
        data: updateVideoDto,
      });
    } catch (error) {
      throw new NotFoundException('Video not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.video.delete({
        where: { id },
      });
      return { message: 'Video deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Video not found');
    }
  }
}