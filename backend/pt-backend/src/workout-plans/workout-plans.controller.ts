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
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('workout-plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workout-plans')
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @ApiOperation({ summary: 'Create a new workout plan' })
  @ApiResponse({ status: 201, description: 'Workout plan created successfully' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
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
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutPlansService.findOne(id);
  }

  @ApiOperation({ summary: 'Update workout plan' })
  @ApiResponse({ status: 200, description: 'Workout plan updated successfully' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto) {
    return this.workoutPlansService.update(id, updateWorkoutPlanDto);
  }

  @ApiOperation({ summary: 'Delete workout plan' })
  @ApiResponse({ status: 200, description: 'Workout plan deleted successfully' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutPlansService.remove(id);
  }

  @ApiOperation({ summary: 'Duplicate workout plan for another client' })
  @ApiResponse({ status: 201, description: 'Workout plan duplicated successfully' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Body('clientId') clientId: string) {
    return this.workoutPlansService.duplicate(id, clientId);
  }
}