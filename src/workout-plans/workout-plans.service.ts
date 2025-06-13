import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto, DuplicateWorkoutPlanDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkoutPlanDto: CreateWorkoutPlanDto, userId: string, userRole: UserRole) {
    // Only admins can create workout plans
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể tạo kế hoạch tập luyện');
    }

    const { exercises, ...planData } = createWorkoutPlanDto;

    return this.prisma.workoutPlan.create({
      data: {
        ...planData,
        createdBy: userId,
        exercises: {
          create: exercises?.map((exercise, index) => ({
            dayName: exercise.dayName,
            isRestDay: exercise.isRestDay,
            exerciseName: exercise.exerciseName,
            exerciseOrder: index,
            sets: {
              create: exercise.sets?.map((set, setIndex) => ({
                setNumber: setIndex + 1,
                targetReps: set.targetReps,
                actualReps: set.actualReps || set.targetReps,
                weightKg: set.weightKg || 0,
                volume: (set.actualReps || set.targetReps) * (set.weightKg || 0),
              })) || [],
            },
          })) || [],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            exerciseOrder: 'asc',
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole) {
    const where = userRole === UserRole.ADMIN 
      ? {} 
      : { clientId: userId };

    return this.prisma.workoutPlan.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            exerciseOrder: 'asc',
          },
        },
      },
      orderBy: [
        { clientId: 'asc' },
        { weekNumber: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            exerciseOrder: 'asc',
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundException('Không tìm thấy kế hoạch tập luyện');
    }

    // Check permissions
    if (userRole !== UserRole.ADMIN && workoutPlan.clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập kế hoạch này');
    }

    return workoutPlan;
  }

  async update(id: string, updateWorkoutPlanDto: UpdateWorkoutPlanDto, userId: string, userRole: UserRole) {
    const workoutPlan = await this.findOne(id, userId, userRole);

    // Admins can update any plan, clients can only update their own
    if (userRole !== UserRole.ADMIN && workoutPlan.clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật kế hoạch này');
    }

    const { exercises, ...planData } = updateWorkoutPlanDto;

    // If exercises are provided, update them
    if (exercises) {
      // Delete existing exercises and create new ones
      await this.prisma.exercise.deleteMany({
        where: { workoutPlanId: id },
      });
    }

    return this.prisma.workoutPlan.update({
      where: { id },
      data: {
        ...planData,
        ...(exercises && {
          exercises: {
            create: exercises.map((exercise, index) => ({
              dayName: exercise.dayName,
              isRestDay: exercise.isRestDay,
              exerciseName: exercise.exerciseName,
              exerciseOrder: index,
              sets: {
                create: exercise.sets?.map((set, setIndex) => ({
                  setNumber: setIndex + 1,
                  targetReps: set.targetReps,
                  actualReps: set.actualReps || set.targetReps,
                  weightKg: set.weightKg || 0,
                  volume: (set.actualReps || set.targetReps) * (set.weightKg || 0),
                })) || [],
              },
            })),
          },
        }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            exerciseOrder: 'asc',
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const workoutPlan = await this.findOne(id, userId, userRole);

    // Only admins can delete workout plans
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể xóa kế hoạch tập luyện');
    }

    return this.prisma.workoutPlan.delete({
      where: { id },
    });
  }

  async duplicate(id: string, duplicateDto: DuplicateWorkoutPlanDto, userId: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể sao chép kế hoạch tập luyện');
    }

    const originalPlan = await this.findOne(id, userId, userRole);

    return this.prisma.workoutPlan.create({
      data: {
        name: `${originalPlan.name} (Copy)`,
        clientId: duplicateDto.clientId,
        weekNumber: 1,
        startDate: new Date(),
        createdBy: userId,
        exercises: {
          create: originalPlan.exercises.map(exercise => ({
            dayName: exercise.dayName,
            isRestDay: exercise.isRestDay,
            exerciseName: exercise.exerciseName,
            exerciseOrder: exercise.exerciseOrder,
            sets: {
              create: exercise.sets.map(set => ({
                setNumber: set.setNumber,
                targetReps: set.targetReps,
                actualReps: set.targetReps,
                weightKg: set.weightKg,
                volume: set.targetReps * (set.weightKg || 0),
              })),
            },
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            exerciseOrder: 'asc',
          },
        },
      },
    });
  }

  async createNewWeek(clientId: string, templatePlanId: string, userId: string, userRole: UserRole) {
    // Clients can create new weeks for themselves, admins can create for anyone
    if (userRole !== UserRole.ADMIN && clientId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể tạo tuần mới cho chính mình');
    }

    const templatePlan = await this.findOne(templatePlanId, userId, userRole);
    
    // Find the highest week number for this client
    const lastPlan = await this.prisma.workoutPlan.findFirst({
      where: { clientId },
      orderBy: { weekNumber: 'desc' },
    });

    const newWeekNumber = (lastPlan?.weekNumber || 0) + 1;

    return this.prisma.workoutPlan.create({
      data: {
        name: templatePlan.name,
        clientId,
        weekNumber: newWeekNumber,
        startDate: new Date(),
        createdBy: userRole === UserRole.ADMIN ? userId : null,
        exercises: {
          create: templatePlan.exercises.map(exercise => ({
            dayName: exercise.dayName,
            isRestDay: exercise.isRestDay,
            exerciseName: exercise.exerciseName,
            exerciseOrder: exercise.exerciseOrder,
            sets: {
              create: exercise.sets.map(set => ({
                setNumber: set.setNumber,
                targetReps: set.targetReps,
                actualReps: set.targetReps,
                weightKg: set.weightKg,
                volume: set.targetReps * (set.weightKg || 0),
              })),
            },
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            exerciseOrder: 'asc',
          },
        },
      },
    });
  }

  async getClientPlans(clientId: string, userId: string, userRole: UserRole) {
    // Check permissions
    if (userRole !== UserRole.ADMIN && clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem kế hoạch của người khác');
    }

    return this.prisma.workoutPlan.findMany({
      where: { clientId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
          },
        },
        exercises: {
          include: {
            sets: true,
          },
          orderBy: {
            exerciseOrder: 'asc',
          },
        },
      },
      orderBy: {
        weekNumber: 'desc',
      },
    });
  }
}