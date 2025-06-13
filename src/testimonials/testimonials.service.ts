import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  async create(createTestimonialDto: CreateTestimonialDto, userRole: UserRole) {
    // Only admins can create testimonials
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể tạo phản hồi');
    }

    return this.prisma.testimonial.create({
      data: createTestimonialDto,
    });
  }

  async findAll(userRole?: UserRole) {
    // Public endpoint - only show published testimonials for non-admins
    const where = userRole === UserRole.ADMIN 
      ? {} 
      : { isPublished: true };

    return this.prisma.testimonial.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      throw new NotFoundException('Không tìm thấy phản hồi');
    }

    return testimonial;
  }

  async update(id: string, updateTestimonialDto: UpdateTestimonialDto, userRole: UserRole) {
    // Only admins can update testimonials
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể cập nhật phản hồi');
    }

    const testimonial = await this.findOne(id);

    return this.prisma.testimonial.update({
      where: { id },
      data: updateTestimonialDto,
    });
  }

  async remove(id: string, userRole: UserRole) {
    // Only admins can delete testimonials
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể xóa phản hồi');
    }

    const testimonial = await this.findOne(id);

    return this.prisma.testimonial.delete({
      where: { id },
    });
  }

  async togglePublish(id: string, userRole: UserRole) {
    // Only admins can toggle publish status
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể thay đổi trạng thái xuất bản');
    }

    const testimonial = await this.findOne(id);

    return this.prisma.testimonial.update({
      where: { id },
      data: {
        isPublished: !testimonial.isPublished,
      },
    });
  }
}