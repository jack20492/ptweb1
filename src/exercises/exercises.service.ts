import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateExerciseSetDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async updateSet(setId: string, updateSetDto: UpdateExerciseSetDto, userId: string, userRole: UserRole) {
    // Find the set and check permissions
    const set = await this.prisma.exerciseSet.findUnique({
      where: { id: setId },
      include: {
        exercise: {
          include: {
            workoutPlan: true,
          },
        },
      },
    });

    if (!set) {
      throw new NotFoundException('Không tìm thấy set bài tập');
    }

    // Check permissions
    if (userRole !== UserRole.ADMIN && set.exercise.workoutPlan.clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật set này');
    }

    // Calculate volume if weight or reps changed
    const actualReps = updateSetDto.actualReps ?? set.actualReps ?? set.targetReps;
    const weightKg = updateSetDto.weightKg ?? set.weightKg ?? 0;
    const volume = actualReps * weightKg;

    return this.prisma.exerciseSet.update({
      where: { id: setId },
      data: {
        ...updateSetDto,
        volume,
      },
    });
  }

  async findExercisesByPlan(planId: string, userId: string, userRole: UserRole) {
    // Check if user has access to this plan
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Không tìm thấy kế hoạch tập luyện');
    }

    if (userRole !== UserRole.ADMIN && plan.clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem kế hoạch này');
    }

    return this.prisma.exercise.findMany({
      where: { workoutPlanId: planId },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' },
        },
      },
      orderBy: { exerciseOrder: 'asc' },
    });
  }
}