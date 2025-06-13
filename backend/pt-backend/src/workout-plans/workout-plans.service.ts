import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkoutPlanDto: CreateWorkoutPlanDto, userId: string, userRole: UserRole) {
    const { days, ...planData } = createWorkoutPlanDto;

    // Check if user can create workout plans for this client
    if (userRole !== UserRole.ADMIN && planData.clientId !== userId) {
      throw new ForbiddenException('You can only create workout plans for yourself');
    }

    return this.prisma.workoutPlan.create({
      data: {
        ...planData,
        startDate: new Date(planData.startDate),
        days: {
          create: days.map(day => ({
            day: day.day,
            isRestDay: day.isRestDay || false,
            dayOrder: day.dayOrder,
            exercises: {
              create: day.exercises.map(exercise => ({
                name: exercise.name,
                exerciseOrder: exercise.exerciseOrder,
                sets: {
                  create: exercise.sets.map(set => ({
                    setNumber: set.setNumber,
                    reps: set.reps,
                    reality: set.reality,
                    weight: set.weight,
                    volume: set.volume,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        trainer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
              orderBy: { exerciseOrder: 'asc' },
            },
          },
          orderBy: { dayOrder: 'asc' },
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

    const [workoutPlans, total] = await Promise.all([
      this.prisma.workoutPlan.findMany({
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
          trainer: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          days: {
            include: {
              exercises: {
                include: {
                  sets: true,
                },
                orderBy: { exerciseOrder: 'asc' },
              },
            },
            orderBy: { dayOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workoutPlan.count({ where }),
    ]);

    return {
      data: workoutPlans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
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
        trainer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
              orderBy: { exerciseOrder: 'asc' },
            },
          },
          orderBy: { dayOrder: 'asc' },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundException('Workout plan not found');
    }

    // Check access permissions
    if (userRole === UserRole.CLIENT && workoutPlan.clientId !== userId) {
      throw new ForbiddenException('You can only access your own workout plans');
    }

    return workoutPlan;
  }

  async update(id: string, updateWorkoutPlanDto: UpdateWorkoutPlanDto, userId: string, userRole: UserRole) {
    const workoutPlan = await this.findOne(id, userId, userRole);

    const { days, ...planData } = updateWorkoutPlanDto;

    // Update the workout plan
    const updatedPlan = await this.prisma.workoutPlan.update({
      where: { id },
      data: {
        ...planData,
        startDate: planData.startDate ? new Date(planData.startDate) : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        trainer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
              orderBy: { exerciseOrder: 'asc' },
            },
          },
          orderBy: { dayOrder: 'asc' },
        },
      },
    });

    // If days are provided, update them
    if (days) {
      // Delete existing days and recreate them
      await this.prisma.workoutDay.deleteMany({
        where: { workoutPlanId: id },
      });

      await this.prisma.workoutDay.createMany({
        data: days.map(day => ({
          workoutPlanId: id,
          day: day.day,
          isRestDay: day.isRestDay || false,
          dayOrder: day.dayOrder,
        })),
      });

      // Create exercises and sets for each day
      for (const day of days) {
        const createdDay = await this.prisma.workoutDay.findFirst({
          where: {
            workoutPlanId: id,
            day: day.day,
          },
        });

        if (createdDay && day.exercises.length > 0) {
          for (const exercise of day.exercises) {
            const createdExercise = await this.prisma.exercise.create({
              data: {
                workoutDayId: createdDay.id,
                name: exercise.name,
                exerciseOrder: exercise.exerciseOrder,
              },
            });

            await this.prisma.exerciseSet.createMany({
              data: exercise.sets.map(set => ({
                exerciseId: createdExercise.id,
                setNumber: set.setNumber,
                reps: set.reps,
                reality: set.reality,
                weight: set.weight,
                volume: set.volume,
              })),
            });
          }
        }
      }
    }

    return this.findOne(id, userId, userRole);
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    await this.findOne(id, userId, userRole);

    return this.prisma.workoutPlan.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        clientId: true,
      },
    });
  }

  async duplicate(id: string, clientId: string, userId: string, userRole: UserRole) {
    const originalPlan = await this.findOne(id, userId, userRole);

    // Create a new workout plan based on the original
    const { days, ...planData } = originalPlan;
    
    return this.prisma.workoutPlan.create({
      data: {
        name: `${planData.name} (Copy)`,
        clientId,
        trainerId: planData.trainerId,
        weekNumber: 1,
        startDate: new Date(),
        createdBy: 'admin',
        days: {
          create: days.map(day => ({
            day: day.day,
            isRestDay: day.isRestDay,
            dayOrder: day.dayOrder,
            exercises: {
              create: day.exercises.map(exercise => ({
                name: exercise.name,
                exerciseOrder: exercise.exerciseOrder,
                sets: {
                  create: exercise.sets.map(set => ({
                    setNumber: set.setNumber,
                    reps: set.reps,
                    reality: set.reality || set.reps,
                    weight: set.weight || 0,
                    volume: (set.reality || set.reps) * (set.weight || 0),
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        trainer: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
              orderBy: { exerciseOrder: 'asc' },
            },
          },
          orderBy: { dayOrder: 'asc' },
        },
      },
    });
  }
}