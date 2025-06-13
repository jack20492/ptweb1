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
import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @ApiOperation({ summary: 'Tạo video mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo video thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createVideoDto: CreateVideoDto, @Request() req) {
    return this.videosService.create(createVideoDto, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy danh sách video (Public - chỉ hiển thị video đã xuất bản)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  findAll(@Request() req) {
    // Check if user is authenticated and get their role
    const userRole = req.user?.role;
    return this.videosService.findAll(userRole);
  }

  @ApiOperation({ summary: 'Lấy danh sách danh mục video' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('categories')
  getCategories() {
    return this.videosService.getCategories();
  }

  @ApiOperation({ summary: 'Lấy video theo danh mục' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiQuery({ name: 'category', description: 'Tên danh mục' })
  @Get('category/:category')
  findByCategory(@Param('category') category: string, @Request() req) {
    const userRole = req.user?.role;
    return this.videosService.findByCategory(category, userRole);
  }

  @ApiOperation({ summary: 'Lấy chi tiết video' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy video' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật video (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateVideoDto: UpdateVideoDto,
    @Request() req
  ) {
    return this.videosService.update(id, updateVideoDto, req.user.role);
  }

  @ApiOperation({ summary: 'Thay đổi trạng thái xuất bản video (Admin only)' })
  @ApiResponse({ status: 200, description: 'Thay đổi trạng thái thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/toggle-publish')
  togglePublish(@Param('id') id: string, @Request() req) {
    return this.videosService.togglePublish(id, req.user.role);
  }

  @ApiOperation({ summary: 'Xóa video (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.videosService.remove(id, req.user.role);
  }
}