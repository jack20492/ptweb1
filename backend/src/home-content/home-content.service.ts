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
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findLatest() {
    const homeContent = await this.prisma.homeContent.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!homeContent) {
      throw new NotFoundException('Home content not found');
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
    try {
      return await this.prisma.homeContent.update({
        where: { id },
        data: updateHomeContentDto,
      });
    } catch (error) {
      throw new NotFoundException('Home content not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.homeContent.delete({
        where: { id },
      });
      return { message: 'Home content deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Home content not found');
    }
  }
}