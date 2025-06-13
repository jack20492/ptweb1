import { 
  Controller, 
  Get, 
  Patch, 
  Body, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContactInfoService } from './contact-info.service';
import { UpdateContactInfoDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Contact Info')
@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @ApiOperation({ summary: 'Lấy thông tin liên hệ (Public)' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông tin liên hệ' })
  @Get()
  findOne() {
    return this.contactInfoService.findOne();
  }

  @ApiOperation({ summary: 'Cập nhật thông tin liên hệ (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch()
  update(@Body() updateContactInfoDto: UpdateContactInfoDto, @Request() req) {
    return this.contactInfoService.update(updateContactInfoDto, req.user.role);
  }
}