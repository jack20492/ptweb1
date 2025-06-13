import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Body, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { UpdateExerciseSetDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Exercises')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @ApiOperation({ summary: 'Lấy danh sách bài tập theo kế hoạch' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('plan/:planId')
  findByPlan(@Param('planId') planId: string, @Request() req) {
    return this.exercisesService.findExercisesByPlan(planId, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin set bài tập' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Patch('sets/:setId')
  updateSet(
    @Param('setId') setId: string,
    @Body() updateSetDto: UpdateExerciseSetDto,
    @Request() req
  ) {
    return this.exercisesService.updateSet(setId, updateSetDto, req.user.userId, req.user.role);
  }
}