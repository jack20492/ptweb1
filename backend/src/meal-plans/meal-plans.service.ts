import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Injectable()
export class MealPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto) {
    const { meals, ...mealPlanData } = createMealPlanDto;
    
    return this.prisma.mealPlan.create({
      data: {
        ...mealPlanData,
        meals: {
          create: meals?.map(meal => ({
            ...meal,
            foods: {
              create: meal.foods,
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
        meals: {
          include: {
            foods: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.mealPlan.findMany({
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        meals: {
          include: {
            foods: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        meals: {
          include: {
            foods: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    return mealPlan;
  }

  async findByClient(clientId: string) {
    return this.prisma.mealPlan.findMany({
      where: { clientId },
      include: {
        meals: {
          include: {
            foods: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateMealPlanDto: UpdateMealPlanDto) {
    const { meals, ...mealPlanData } = updateMealPlanDto;

    try {
      // If meals are provided, update them
      if (meals) {
        // Delete existing meals and their foods
        await this.prisma.meal.deleteMany({
          where: { mealPlanId: id },
        });
      }

      return await this.prisma.mealPlan.update({
        where: { id },
        data: {
          ...mealPlanData,
          ...(meals && {
            meals: {
              create: meals.map(meal => ({
                ...meal,
                foods: {
                  create: meal.foods,
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
          meals: {
            include: {
              foods: {
                orderBy: {
                  order: 'asc',
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException('Meal plan not found');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.mealPlan.delete({
        where: { id },
      });
      return { message: 'Meal plan deleted successfully' };
    } catch (error) {
      throw new NotFoundException('Meal plan not found');
    }
  }
}