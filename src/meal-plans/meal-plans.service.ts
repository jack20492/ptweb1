import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class MealPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createMealPlanDto: CreateMealPlanDto, userId: string, userRole: UserRole) {
    // Only admins can create meal plans
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể tạo kế hoạch dinh dưỡng');
    }

    const { meals, ...planData } = createMealPlanDto;

    // Calculate total calories
    const totalCalories = meals?.reduce((total, meal) => {
      const mealCalories = meal.foods?.reduce((mealTotal, food) => mealTotal + (food.calories || 0), 0) || 0;
      return total + mealCalories;
    }, 0) || 0;

    return this.prisma.mealPlan.create({
      data: {
        ...planData,
        totalCalories,
        meals: {
          create: meals?.map((meal, mealIndex) => ({
            name: meal.name,
            totalCalories: meal.foods?.reduce((total, food) => total + (food.calories || 0), 0) || 0,
            mealOrder: mealIndex,
            foods: {
              create: meal.foods?.map((food, foodIndex) => ({
                name: food.name,
                macroType: food.macroType,
                calories: food.calories || 0,
                notes: food.notes,
                foodOrder: foodIndex,
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

  async findAll(userId: string, userRole: UserRole) {
    const where = userRole === UserRole.ADMIN 
      ? {} 
      : { clientId: userId };

    return this.prisma.mealPlan.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const mealPlan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
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
      throw new NotFoundException('Không tìm thấy kế hoạch dinh dưỡng');
    }

    // Check permissions
    if (userRole !== UserRole.ADMIN && mealPlan.clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập kế hoạch này');
    }

    return mealPlan;
  }

  async update(id: string, updateMealPlanDto: UpdateMealPlanDto, userId: string, userRole: UserRole) {
    const mealPlan = await this.findOne(id, userId, userRole);

    // Only admins can update meal plans
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể cập nhật kế hoạch dinh dưỡng');
    }

    const { meals, ...planData } = updateMealPlanDto;

    // If meals are provided, update them
    if (meals) {
      // Delete existing meals and create new ones
      await this.prisma.meal.deleteMany({
        where: { mealPlanId: id },
      });

      // Calculate total calories
      const totalCalories = meals.reduce((total, meal) => {
        const mealCalories = meal.foods?.reduce((mealTotal, food) => mealTotal + (food.calories || 0), 0) || 0;
        return total + mealCalories;
      }, 0);

      planData.totalCalories = totalCalories;
    }

    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        ...planData,
        ...(meals && {
          meals: {
            create: meals.map((meal, mealIndex) => ({
              name: meal.name,
              totalCalories: meal.foods?.reduce((total, food) => total + (food.calories || 0), 0) || 0,
              mealOrder: mealIndex,
              foods: {
                create: meal.foods?.map((food, foodIndex) => ({
                  name: food.name,
                  macroType: food.macroType,
                  calories: food.calories || 0,
                  notes: food.notes,
                  foodOrder: foodIndex,
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

  async remove(id: string, userId: string, userRole: UserRole) {
    const mealPlan = await this.findOne(id, userId, userRole);

    // Only admins can delete meal plans
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể xóa kế hoạch dinh dưỡng');
    }

    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }

  async getClientMealPlans(clientId: string, userId: string, userRole: UserRole) {
    // Check permissions
    if (userRole !== UserRole.ADMIN && clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem kế hoạch của người khác');
    }

    return this.prisma.mealPlan.findMany({
      where: { clientId },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}