import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) {}

  async create(createContactInfoDto: CreateContactInfoDto) {
    return this.prisma.contactInfo.create({
      data: createContactInfoDto,
    });
  }

  async findAll() {
    return this.prisma.contactInfo.findMany();
  }

  async findCurrent() {
    const contactInfo = await this.prisma.contactInfo.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!contactInfo) {
      // Create default contact info if none exists
      return this.create({
        phone: '0123456789',
        facebook: 'https://facebook.com/phinpt',
        zalo: 'https://zalo.me/0123456789',
        email: 'contact@phinpt.com',
      });
    }

    return contactInfo;
  }

  async findOne(id: string) {
    const contactInfo = await this.prisma.contactInfo.findUnique({
      where: { id },
    });

    if (!contactInfo) {
      throw new NotFoundException('Contact info not found');
    }

    return contactInfo;
  }

  async update(id: string, updateContactInfoDto: UpdateContactInfoDto) {
    const contactInfo = await this.findOne(id);
    
    return this.prisma.contactInfo.update({
      where: { id },
      data: updateContactInfoDto,
    });
  }

  async updateCurrent(updateContactInfoDto: UpdateContactInfoDto) {
    const current = await this.findCurrent();
    return this.update(current.id, updateContactInfoDto);
  }

  async remove(id: string) {
    const contactInfo = await this.findOne(id);
    
    return this.prisma.contactInfo.delete({
      where: { id },
    });
  }
}