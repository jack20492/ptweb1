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
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Testimonials')
@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @ApiOperation({ summary: 'Tạo phản hồi mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo phản hồi thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createTestimonialDto: CreateTestimonialDto, @Request() req) {
    return this.testimonialsService.create(createTestimonialDto, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy danh sách phản hồi (Public - chỉ hiển thị phản hồi đã xuất bản)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  findAll(@Request() req) {
    // Check if user is authenticated and get their role
    const userRole = req.user?.role;
    return this.testimonialsService.findAll(userRole);
  }

  @ApiOperation({ summary: 'Lấy chi tiết phản hồi' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy phản hồi' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimonialsService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật phản hồi (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateTestimonialDto: UpdateTestimonialDto,
    @Request() req
  ) {
    return this.testimonialsService.update(id, updateTestimonialDto, req.user.role);
  }

  @ApiOperation({ summary: 'Thay đổi trạng thái xuất bản phản hồi (Admin only)' })
  @ApiResponse({ status: 200, description: 'Thay đổi trạng thái thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/toggle-publish')
  togglePublish(@Param('id') id: string, @Request() req) {
    return this.testimonialsService.togglePublish(id, req.user.role);
  }

  @ApiOperation({ summary: 'Xóa phản hồi (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.testimonialsService.remove(id, req.user.role);
  }
}