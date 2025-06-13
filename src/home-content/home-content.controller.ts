import { 
  Controller, 
  Get, 
  Patch, 
  Body, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeContentService } from './home-content.service';
import { UpdateHomeContentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Home Content')
@Controller('home-content')
export class HomeContentController {
  constructor(private readonly homeContentService: HomeContentService) {}

  @ApiOperation({ summary: 'Lấy nội dung trang chủ (Public)' })
  @ApiResponse({ status: 200, description: 'Lấy nội dung thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy nội dung trang chủ' })
  @Get()
  findOne() {
    return this.homeContentService.findOne();
  }

  @ApiOperation({ summary: 'Cập nhật nội dung trang chủ (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch()
  update(@Body() updateHomeContentDto: UpdateHomeContentDto, @Request() req) {
    return this.homeContentService.update(updateHomeContentDto, req.user.role);
  }
}