import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';
import { UpdateWeightRecordDto } from './dto/update-weight-record.dto';

@Injectable()
export class WeightRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createWeightRecordDto: CreateWeightRecordDto) {
    return this.prisma.weightRecord.create({
      data: createWeightRecordDto,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.weightRecord.findMany({
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.weightRecord.findMany({
      where: { clientId },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const weightRecord = await this.prisma.weightRecord.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!weightRecord) {
      throw new NotFoundException('Weight record not found');
    }

    return weightRecord;
  }

  async update(id: string, updateWeightRecordDto: UpdateWeightRecordDto) {
    const weightRecord = await this.findOne(id);
    
    return this.prisma.weightRecord.update({
      where: { id },
      data: updateWeightRecordDto,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const weightRecord = await this.findOne(id);
    
    return this.prisma.weightRecord.delete({
      where: { id },
    });
  }
}