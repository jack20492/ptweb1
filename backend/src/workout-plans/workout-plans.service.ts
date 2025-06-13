import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkoutPlanDto: CreateWorkoutPlanDto) {
    return this.prisma.workoutPlan.create({
      data: createWorkoutPlanDto,
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.workoutPlan.findMany({
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundException('Workout plan not found');
    }

    return workoutPlan;
  }

  async findByClient(clientId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { clientId },
      include: {
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        weekNumber: 'desc',
      },
    });
  }

  async update(id: string, updateWorkoutPlanDto: UpdateWorkoutPlanDto) {
    try {
      return await this.prisma.workoutPlan.update({
        where: { id },
        data: updateWorkoutPlanDto,
        include: {
          client: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          exercises: {
            include: {
              sets: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Workout plan not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.workoutPlan.delete({
        where: { id },
      });
      return { message: 'Workout plan deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Workout plan not found');
    }
  }
}