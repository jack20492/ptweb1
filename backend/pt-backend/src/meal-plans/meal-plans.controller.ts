import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Meal Plans')
@Controller('meal-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal plan' })
  @ApiResponse({ status: 201, description: 'Meal plan created successfully' })
  create(@Body() createMealPlanDto: CreateMealPlanDto, @Request() req) {
    return this.mealPlansService.create(createMealPlanDto, req.user.id, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal plans' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Meal plans retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('clientId') clientId?: string,
    @Request() req?,
  ) {
    return this.mealPlansService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      req.user.id,
      req.user.role,
      clientId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal plan by ID' })
  @ApiResponse({ status: 200, description: 'Meal plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.mealPlansService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update meal plan' })
  @ApiResponse({ status: 200, description: 'Meal plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  update(
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
    @Request() req,
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meal plan' })
  @ApiResponse({ status: 200, description: 'Meal plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Meal plan not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.mealPlansService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/duplicate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Duplicate meal plan for another client (Admin only)' })
  @ApiResponse({ status: 201, description: 'Meal plan duplicated successfully' })
  duplicate(
    @Param('id') id: string,
    @Body('clientId') clientId: string,
    @Request() req,
  ) {
    return this.mealPlansService.duplicate(id, clientId, req.user.id, req.user.role);
  }
}