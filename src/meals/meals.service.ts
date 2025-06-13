import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async findMealsByPlan(planId: string, userId: string, userRole: UserRole) {
    // Check if user has access to this meal plan
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Không tìm thấy kế hoạch dinh dưỡng');
    }

    if (userRole !== UserRole.ADMIN && plan.clientId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem kế hoạch này');
    }

    return this.prisma.meal.findMany({
      where: { mealPlanId: planId },
      include: {
        foods: {
          orderBy: { foodOrder: 'asc' },
        },
      },
      orderBy: { mealOrder: 'asc' },
    });
  }
}