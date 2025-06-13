import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkoutPlanDto: CreateWorkoutPlanDto) {
    const { days, ...planData } = createWorkoutPlanDto;

    return this.prisma.workoutPlan.create({
      data: {
        ...planData,
        days: {
          create: days?.map((day) => ({
            day: day.day,
            isRestDay: day.isRestDay,
            exercises: {
              create: day.exercises?.map((exercise) => ({
                name: exercise.name,
                sets: {
                  create: exercise.sets?.map((set) => ({
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
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
            },
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
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
            },
          },
        },
      },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { clientId },
      include: {
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
            },
          },
        },
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
        days: {
          include: {
            exercises: {
              include: {
                sets: true,
              },
            },
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundException('Workout plan not found');
    }

    return workoutPlan;
  }

  async update(id: string, updateWorkoutPlanDto: UpdateWorkoutPlanDto) {
    const workoutPlan = await this.findOne(id);
    
    const { days, ...planData } = updateWorkoutPlanDto;

    if (days) {
      // Delete existing days and recreate
      await this.prisma.workoutDay.deleteMany({
        where: { workoutPlanId: id },
      });
    }

    return this.prisma.workoutPlan.update({
      where: { id },
      data: {
        ...planData,
        ...(days && {
          days: {
            create: days.map((day) => ({
              day: day.day,
              isRestDay: day.isRestDay,
              exercises: {
                create: day.exercises?.map((exercise) => ({
                  name: exercise.name,
                  sets: {
                    create: exercise.sets?.map((set) => ({
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
        }),
      },
      include: {
        client: {
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
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    const workoutPlan = await this.findOne(id);
    
    return this.prisma.workoutPlan.delete({
      where: { id },
    });
  }

  async duplicate(id: string, clientId: string) {
    const originalPlan = await this.findOne(id);
    
    const { id: _, client, createdAt, updatedAt, ...planData } = originalPlan;
    
    return this.create({
      ...planData,
      clientId,
      name: `${planData.name} (Copy)`,
      weekNumber: 1,
      days: planData.days.map(day => ({
        day: day.day,
        isRestDay: day.isRestDay,
        exercises: day.exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            setNumber: set.setNumber,
            reps: set.reps,
            reality: set.reality || set.reps,
            weight: set.weight || 0,
            volume: set.volume || 0,
          })),
        })),
      })),
    });
  }
}