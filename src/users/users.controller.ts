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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Tạo người dùng mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo người dùng thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Request() req) {
    return this.usersService.findAll(req.user.role);
  }

  @ApiOperation({ summary: 'Lấy danh sách khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('clients')
  findClients() {
    return this.usersService.findClients();
  }

  @ApiOperation({ summary: 'Lấy thống kê người dùng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Lấy thống kê thành công' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }

  @ApiOperation({ summary: 'Lấy thông tin người dùng theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.usersService.update(id, updateUserDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Xóa người dùng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.role);
  }
}