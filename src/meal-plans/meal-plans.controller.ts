import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Meal Plans')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @ApiOperation({ summary: 'Tạo kế hoạch dinh dưỡng mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo kế hoạch thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createMealPlanDto: CreateMealPlanDto, @Request() req) {
    return this.mealPlansService.create(createMealPlanDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy danh sách kế hoạch dinh dưỡng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  findAll(@Request() req) {
    return this.mealPlansService.findAll(req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy kế hoạch dinh dưỡng của một khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('client/:clientId')
  getClientMealPlans(@Param('clientId') clientId: string, @Request() req) {
    return this.mealPlansService.getClientMealPlans(clientId, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy chi tiết kế hoạch dinh dưỡng' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kế hoạch' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.mealPlansService.findOne(id, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Cập nhật kế hoạch dinh dưỡng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateMealPlanDto: UpdateMealPlanDto,
    @Request() req
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Xóa kế hoạch dinh dưỡng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.mealPlansService.remove(id, req.user.userId, req.user.role);
  }
}