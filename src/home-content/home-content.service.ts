import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHomeContentDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class HomeContentService {
  constructor(private prisma: PrismaService) {}

  async findOne() {
    // Get the first (and should be only) home content record
    const homeContent = await this.prisma.homeContent.findFirst();
    
    if (!homeContent) {
      throw new NotFoundException('Không tìm thấy nội dung trang chủ');
    }

    return homeContent;
  }

  async update(updateHomeContentDto: UpdateHomeContentDto, userRole: UserRole) {
    // Only admins can update home content
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể cập nhật nội dung trang chủ');
    }

    // Try to find existing home content
    const existingHomeContent = await this.prisma.homeContent.findFirst();

    if (existingHomeContent) {
      // Update existing record
      return this.prisma.homeContent.update({
        where: { id: existingHomeContent.id },
        data: updateHomeContentDto,
      });
    } else {
      // Create new record if none exists
      return this.prisma.homeContent.create({
        data: updateHomeContentDto,
      });
    }
  }
}