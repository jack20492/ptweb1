import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto) {
    const { sets, ...exerciseData } = createExerciseDto;
    
    return this.prisma.exercise.create({
      data: {
        ...exerciseData,
        sets: {
          create: sets,
        },
      },
      include: {
        sets: true,
      },
    });
  }

  async findAll() {
    return this.prisma.exercise.findMany({
      include: {
        sets: true,
        workoutPlan: {
          include: {
            client: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
      include: {
        sets: {
          orderBy: {
            setNumber: 'asc',
          },
        },
        workoutPlan: {
          include: {
            client: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

  async findByWorkoutPlan(workoutPlanId: string) {
    return this.prisma.exercise.findMany({
      where: { workoutPlanId },
      include: {
        sets: {
          orderBy: {
            setNumber: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    const { sets, ...exerciseData } = updateExerciseDto;

    try {
      // If sets are provided, update them
      if (sets) {
        // Delete existing sets and create new ones
        await this.prisma.exerciseSet.deleteMany({
          where: { exerciseId: id },
        });
      }

      return await this.prisma.exercise.update({
        where: { id },
        data: {
          ...exerciseData,
          ...(sets && {
            sets: {
              create: sets,
            },
          }),
        },
        include: {
          sets: {
            orderBy: {
              setNumber: 'asc',
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Exercise not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.exercise.delete({
        where: { id },
      });
      return { message: 'Exercise deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Exercise not found');
    }
  }
}