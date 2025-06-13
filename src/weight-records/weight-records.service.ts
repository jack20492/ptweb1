import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightRecordDto, UpdateWeightRecordDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class WeightRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createWeightRecordDto: CreateWeightRecordDto, userId: string, userRole: UserRole) {
    // Users can only create records for themselves, admins can create for anyone
    if (userRole !== UserRole.ADMIN && createWeightRecordDto.clientId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể tạo bản ghi cân nặng cho chính mình');
    }

    return this.prisma.weightRecord.create({
      data: createWeightRecordDto,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole) {
    const where = userRole === UserRole.ADMIN 
      ? {} 
      : { clientId: userId };

    return this.prisma.weightRecord.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        recordDate: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const weightRecord = await this.prisma.weightRecord.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!weightRecord) {
      throw new NotFoundException('Không tìm thấy bản ghi cân nặng');
    }

    // Check permissions
    if (userRole !== UserRole.ADMIN && weightRecord.clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập bản ghi này');
    }

    return weightRecord;
  }

  async update(id: string, updateWeightRecordDto: UpdateWeightRecordDto, userId: string, userRole: UserRole) {
    const weightRecord = await this.findOne(id, userId, userRole);

    // Users can only update their own records, admins can update any
    if (userRole !== UserRole.ADMIN && weightRecord.clientId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật bản ghi của chính mình');
    }

    return this.prisma.weightRecord.update({
      where: { id },
      data: updateWeightRecordDto,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const weightRecord = await this.findOne(id, userId, userRole);

    // Users can only delete their own records, admins can delete any
    if (userRole !== UserRole.ADMIN && weightRecord.clientId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa bản ghi của chính mình');
    }

    return this.prisma.weightRecord.delete({
      where: { id },
    });
  }

  async getClientRecords(clientId: string, userId: string, userRole: UserRole) {
    // Check permissions
    if (userRole !== UserRole.ADMIN && clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem bản ghi của người khác');
    }

    return this.prisma.weightRecord.findMany({
      where: { clientId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        recordDate: 'desc',
      },
    });
  }

  async getWeightChart(clientId: string, userId: string, userRole: UserRole, limit: number = 10) {
    // Check permissions
    if (userRole !== UserRole.ADMIN && clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem biểu đồ của người khác');
    }

    const records = await this.prisma.weightRecord.findMany({
      where: { clientId },
      select: {
        weightKg: true,
        recordDate: true,
      },
      orderBy: {
        recordDate: 'desc',
      },
      take: limit,
    });

    return records.reverse(); // Return in chronological order for chart
  }
}