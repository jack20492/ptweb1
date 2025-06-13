import { 
  Controller, 
  Get, 
  Param, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Meals')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @ApiOperation({ summary: 'Lấy danh sách bữa ăn theo kế hoạch dinh dưỡng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('plan/:planId')
  findByPlan(@Param('planId') planId: string, @Request() req) {
    return this.mealsService.findMealsByPlan(planId, req.user.userId, req.user.role);
  }
}