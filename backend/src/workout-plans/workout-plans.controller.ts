import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workout Plans')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('workout-plans')
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @ApiOperation({ summary: 'Create a new workout plan' })
  @ApiResponse({ status: 201, description: 'Workout plan created successfully' })
  @Post()
  create(@Body() createWorkoutPlanDto: CreateWorkoutPlanDto) {
    return this.workoutPlansService.create(createWorkoutPlanDto);
  }

  @ApiOperation({ summary: 'Get all workout plans' })
  @ApiResponse({ status: 200, description: 'Workout plans retrieved successfully' })
  @Get()
  findAll(@Query('clientId') clientId?: string) {
    if (clientId) {
      return this.workoutPlansService.findByClient(clientId);
    }
    return this.workoutPlansService.findAll();
  }

  @ApiOperation({ summary: 'Get workout plan by ID' })
  @ApiResponse({ status: 200, description: 'Workout plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Workout plan not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutPlansService.findOne(id);
  }

  @ApiOperation({ summary: 'Update workout plan' })
  @ApiResponse({ status: 200, description: 'Workout plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Workout plan not found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto) {
    return this.workoutPlansService.update(id, updateWorkoutPlanDto);
  }

  @ApiOperation({ summary: 'Delete workout plan' })
  @ApiResponse({ status: 200, description: 'Workout plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Workout plan not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutPlansService.remove(id);
  }
}