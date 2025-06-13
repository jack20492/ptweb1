import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateContactInfoDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) {}

  async findOne() {
    // Get the first (and should be only) contact info record
    const contactInfo = await this.prisma.contactInfo.findFirst();
    
    if (!contactInfo) {
      throw new NotFoundException('Không tìm thấy thông tin liên hệ');
    }

    return contactInfo;
  }

  async update(updateContactInfoDto: UpdateContactInfoDto, userRole: UserRole) {
    // Only admins can update contact info
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể cập nhật thông tin liên hệ');
    }

    // Try to find existing contact info
    const existingContactInfo = await this.prisma.contactInfo.findFirst();

    if (existingContactInfo) {
      // Update existing record
      return this.prisma.contactInfo.update({
        where: { id: existingContactInfo.id },
        data: updateContactInfoDto,
      });
    } else {
      // Create new record if none exists
      return this.prisma.contactInfo.create({
        data: updateContactInfoDto,
      });
    }
  }
}