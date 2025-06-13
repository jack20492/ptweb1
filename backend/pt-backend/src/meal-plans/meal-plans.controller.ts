import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('meal-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @ApiOperation({ summary: 'Create a new meal plan' })
  @ApiResponse({ status: 201, description: 'Meal plan created successfully' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlansService.create(createMealPlanDto);
  }

  @ApiOperation({ summary: 'Get all meal plans' })
  @ApiResponse({ status: 200, description: 'Meal plans retrieved successfully' })
  @Get()
  findAll(@Query('clientId') clientId?: string) {
    if (clientId) {
      return this.mealPlansService.findByClient(clientId);
    }
    return this.mealPlansService.findAll();
  }

  @ApiOperation({ summary: 'Get meal plan by ID' })
  @ApiResponse({ status: 200, description: 'Meal plan retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mealPlansService.findOne(id);
  }

  @ApiOperation({ summary: 'Update meal plan' })
  @ApiResponse({ status: 200, description: 'Meal plan updated successfully' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMealPlanDto: UpdateMealPlanDto) {
    return this.mealPlansService.update(id, updateMealPlanDto);
  }

  @ApiOperation({ summary: 'Delete meal plan' })
  @ApiResponse({ status: 200, description: 'Meal plan deleted successfully' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealPlansService.remove(id);
  }
}