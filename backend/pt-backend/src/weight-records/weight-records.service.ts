import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';
import { UpdateWeightRecordDto } from './dto/update-weight-record.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class WeightRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createWeightRecordDto: CreateWeightRecordDto, userId: string, userRole: UserRole) {
    // Check if user can create weight records for this client
    if (userRole !== UserRole.ADMIN && createWeightRecordDto.clientId !== userId) {
      throw new ForbiddenException('You can only create weight records for yourself');
    }

    return this.prisma.weightRecord.create({
      data: {
        ...createWeightRecordDto,
        date: new Date(createWeightRecordDto.date),
      },
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

  async findAll(page = 1, limit = 10, userId: string, userRole: UserRole, clientId?: string) {
    const skip = (page - 1) * limit;
    
    let where: any = {};
    
    if (userRole === UserRole.CLIENT) {
      where.clientId = userId;
    } else if (clientId) {
      where.clientId = clientId;
    }

    const [weightRecords, total] = await Promise.all([
      this.prisma.weightRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.weightRecord.count({ where }),
    ]);

    return {
      data: weightRecords,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
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

    // Check access permissions
    if (userRole === UserRole.CLIENT && weightRecord.clientId !== userId) {
      throw new ForbiddenException('You can only access your own weight records');
    }

    return weightRecord;
  }

  async update(id: string, updateWeightRecordDto: UpdateWeightRecordDto, userId: string, userRole: UserRole) {
    await this.findOne(id, userId, userRole);

    return this.prisma.weightRecord.update({
      where: { id },
      data: {
        ...updateWeightRecordDto,
        date: updateWeightRecordDto.date ? new Date(updateWeightRecordDto.date) : undefined,
      },
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

  async remove(id: string, userId: string, userRole: UserRole) {
    await this.findOne(id, userId, userRole);

    return this.prisma.weightRecord.delete({
      where: { id },
      select: {
        id: true,
        weight: true,
        date: true,
        clientId: true,
      },
    });
  }

  async getWeightChart(clientId: string, userId: string, userRole: UserRole, limit = 10) {
    // Check access permissions
    if (userRole === UserRole.CLIENT && clientId !== userId) {
      throw new ForbiddenException('You can only access your own weight records');
    }

    const weightRecords = await this.prisma.weightRecord.findMany({
      where: { clientId },
      orderBy: { date: 'asc' },
      take: limit,
      select: {
        id: true,
        weight: true,
        date: true,
        notes: true,
      },
    });

    return weightRecords;
  }
}