import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class MealPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto, userId: string, userRole: UserRole) {
    const { meals, ...planData } = createMealPlanDto;

    // Check if user can create meal plans for this client
    if (userRole !== UserRole.ADMIN && planData.clientId !== userId) {
      throw new ForbiddenException('You can only create meal plans for yourself');
    }

    return this.prisma.mealPlan.create({
      data: {
        ...planData,
        meals: {
          create: meals.map(meal => ({
            name: meal.name,
            totalCalories: meal.totalCalories,
            mealOrder: meal.mealOrder,
            foods: {
              create: meal.foods.map(food => ({
                name: food.name,
                macroType: food.macroType,
                calories: food.calories,
                notes: food.notes,
                foodOrder: food.foodOrder,
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
            foods: {
              orderBy: { foodOrder: 'asc' },
            },
          },
          orderBy: { mealOrder: 'asc' },
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

    const [mealPlans, total] = await Promise.all([
      this.prisma.mealPlan.findMany({
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
          meals: {
            include: {
              foods: {
                orderBy: { foodOrder: 'asc' },
              },
            },
            orderBy: { mealOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mealPlan.count({ where }),
    ]);

    return {
      data: mealPlans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
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
              orderBy: { foodOrder: 'asc' },
            },
          },
          orderBy: { mealOrder: 'asc' },
        },
      },
    });

    if (!mealPlan) {
      throw new NotFoundException('Meal plan not found');
    }

    // Check access permissions
    if (userRole === UserRole.CLIENT && mealPlan.clientId !== userId) {
      throw new ForbiddenException('You can only access your own meal plans');
    }

    return mealPlan;
  }

  async update(id: string, updateMealPlanDto: UpdateMealPlanDto, userId: string, userRole: UserRole) {
    const mealPlan = await this.findOne(id, userId, userRole);

    const { meals, ...planData } = updateMealPlanDto;

    // Update the meal plan
    const updatedPlan = await this.prisma.mealPlan.update({
      where: { id },
      data: planData,
    });

    // If meals are provided, update them
    if (meals) {
      // Delete existing meals and recreate them
      await this.prisma.meal.deleteMany({
        where: { mealPlanId: id },
      });

      await this.prisma.meal.createMany({
        data: meals.map(meal => ({
          mealPlanId: id,
          name: meal.name,
          totalCalories: meal.totalCalories,
          mealOrder: meal.mealOrder,
        })),
      });

      // Create foods for each meal
      for (const meal of meals) {
        const createdMeal = await this.prisma.meal.findFirst({
          where: {
            mealPlanId: id,
            name: meal.name,
            mealOrder: meal.mealOrder,
          },
        });

        if (createdMeal && meal.foods.length > 0) {
          await this.prisma.mealFood.createMany({
            data: meal.foods.map(food => ({
              mealId: createdMeal.id,
              name: food.name,
              macroType: food.macroType,
              calories: food.calories,
              notes: food.notes,
              foodOrder: food.foodOrder,
            })),
          });
        }
      }
    }

    return this.findOne(id, userId, userRole);
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    await this.findOne(id, userId, userRole);

    return this.prisma.mealPlan.delete({
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

    // Create a new meal plan based on the original
    const { meals, ...planData } = originalPlan;
    
    return this.prisma.mealPlan.create({
      data: {
        name: `${planData.name} (Copy)`,
        clientId,
        totalCalories: planData.totalCalories,
        notes: planData.notes,
        meals: {
          create: meals.map(meal => ({
            name: meal.name,
            totalCalories: meal.totalCalories,
            mealOrder: meal.mealOrder,
            foods: {
              create: meal.foods.map(food => ({
                name: food.name,
                macroType: food.macroType,
                calories: food.calories,
                notes: food.notes,
                foodOrder: food.foodOrder,
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
            foods: {
              orderBy: { foodOrder: 'asc' },
            },
          },
          orderBy: { mealOrder: 'asc' },
        },
      },
    });
  }
}