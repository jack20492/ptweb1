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
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto, UpdateWorkoutPlanDto, DuplicateWorkoutPlanDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Workout Plans')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('workout-plans')
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @ApiOperation({ summary: 'Tạo kế hoạch tập luyện mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo kế hoạch thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createWorkoutPlanDto: CreateWorkoutPlanDto, @Request() req) {
    return this.workoutPlansService.create(createWorkoutPlanDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy danh sách kế hoạch tập luyện' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  findAll(@Request() req) {
    return this.workoutPlansService.findAll(req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy kế hoạch tập luyện của một khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('client/:clientId')
  getClientPlans(@Param('clientId') clientId: string, @Request() req) {
    return this.workoutPlansService.getClientPlans(clientId, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy chi tiết kế hoạch tập luyện' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kế hoạch' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.workoutPlansService.findOne(id, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Cập nhật kế hoạch tập luyện' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto,
    @Request() req
  ) {
    return this.workoutPlansService.update(id, updateWorkoutPlanDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Xóa kế hoạch tập luyện (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.workoutPlansService.remove(id, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Sao chép kế hoạch tập luyện cho khách hàng khác (Admin only)' })
  @ApiResponse({ status: 201, description: 'Sao chép thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/duplicate')
  duplicate(
    @Param('id') id: string,
    @Body() duplicateDto: DuplicateWorkoutPlanDto,
    @Request() req
  ) {
    return this.workoutPlansService.duplicate(id, duplicateDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Tạo tuần tập luyện mới dựa trên template' })
  @ApiResponse({ status: 201, description: 'Tạo tuần mới thành công' })
  @Post(':templateId/new-week/:clientId')
  createNewWeek(
    @Param('templateId') templateId: string,
    @Param('clientId') clientId: string,
    @Request() req
  ) {
    return this.workoutPlansService.createNewWeek(clientId, templateId, req.user.userId, req.user.role);
  }
}