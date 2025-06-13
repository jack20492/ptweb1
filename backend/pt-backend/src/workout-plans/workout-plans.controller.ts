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
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Workout Plans')
@Controller('workout-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workout plan' })
  @ApiResponse({ status: 201, description: 'Workout plan created successfully' })
  create(@Body() createWorkoutPlanDto: CreateWorkoutPlanDto, @Request() req) {
    return this.workoutPlansService.create(createWorkoutPlanDto, req.user.id, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workout plans' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Workout plans retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('clientId') clientId?: string,
    @Request() req?,
  ) {
    return this.workoutPlansService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      req.user.id,
      req.user.role,
      clientId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workout plan by ID' })
  @ApiResponse({ status: 200, description: 'Workout plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workout plan not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.workoutPlansService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workout plan' })
  @ApiResponse({ status: 200, description: 'Workout plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Workout plan not found' })
  update(
    @Param('id') id: string,
    @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto,
    @Request() req,
  ) {
    return this.workoutPlansService.update(id, updateWorkoutPlanDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workout plan' })
  @ApiResponse({ status: 200, description: 'Workout plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workout plan not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.workoutPlansService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/duplicate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Duplicate workout plan for another client (Admin only)' })
  @ApiResponse({ status: 201, description: 'Workout plan duplicated successfully' })
  duplicate(
    @Param('id') id: string,
    @Body('clientId') clientId: string,
    @Request() req,
  ) {
    return this.workoutPlansService.duplicate(id, clientId, req.user.id, req.user.role);
  }
}