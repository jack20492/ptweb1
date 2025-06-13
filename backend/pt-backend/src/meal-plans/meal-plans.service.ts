import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';

@Injectable()
export class MealPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto) {
    const { meals, ...planData } = createMealPlanDto;

    return this.prisma.mealPlan.create({
      data: {
        ...planData,
        meals: {
          create: meals?.map((meal) => ({
            name: meal.name,
            totalCalories: meal.totalCalories,
            foods: {
              create: meal.foods?.map((food) => ({
                name: food.name,
                macroType: food.macroType,
                calories: food.calories,
                notes: food.notes,
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
        meals: {
          include: {
            foods: true,
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
            foods: true,
          },
        },
      },
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.mealPlan.findMany({
      where: { clientId },
      include: {
        meals: {
          include: {
            foods: true,
          },
        },
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
            foods: true,
          },
        },
      },
    });

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    return mealPlan;
  }

  async update(id: string, updateMealPlanDto: UpdateMealPlanDto) {
    const mealPlan = await this.findOne(id);
    
    const { meals, ...planData } = updateMealPlanDto;

    if (meals) {
      // Delete existing meals and recreate
      await this.prisma.meal.deleteMany({
        where: { mealPlanId: id },
      });
    }

    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        ...planData,
        ...(meals && {
          meals: {
            create: meals.map((meal) => ({
              name: meal.name,
              totalCalories: meal.totalCalories,
              foods: {
                create: meal.foods?.map((food) => ({
                  name: food.name,
                  macroType: food.macroType,
                  calories: food.calories,
                  notes: food.notes,
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
        meals: {
          include: {
            foods: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const mealPlan = await this.findOne(id);
    
    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }
}