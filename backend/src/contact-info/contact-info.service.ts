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
    return this.prisma.contactInfo.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findLatest() {
    const contactInfo = await this.prisma.contactInfo.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!contactInfo) {
      throw new NotFoundException('Contact info not found');
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
    try {
      return await this.prisma.contactInfo.update({
        where: { id },
        data: updateContactInfoDto,
      });
    } catch (error) {
      throw new NotFoundException('Contact info not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.contactInfo.delete({
        where: { id },
      });
      return { message: 'Contact info deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Contact info not found');
    }
  }
}