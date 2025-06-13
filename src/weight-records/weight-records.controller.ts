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
import { WeightRecordsService } from './weight-records.service';
import { CreateWeightRecordDto, UpdateWeightRecordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Weight Records')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('weight-records')
export class WeightRecordsController {
  constructor(private readonly weightRecordsService: WeightRecordsService) {}

  @ApiOperation({ summary: 'Tạo bản ghi cân nặng mới' })
  @ApiResponse({ status: 201, description: 'Tạo bản ghi thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Post()
  create(@Body() createWeightRecordDto: CreateWeightRecordDto, @Request() req) {
    return this.weightRecordsService.create(createWeightRecordDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy danh sách bản ghi cân nặng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get()
  findAll(@Request() req) {
    return this.weightRecordsService.findAll(req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy bản ghi cân nặng của một khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @Get('client/:clientId')
  getClientRecords(@Param('clientId') clientId: string, @Request() req) {
    return this.weightRecordsService.getClientRecords(clientId, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Lấy dữ liệu biểu đồ cân nặng của khách hàng' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu thành công' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi tối đa (mặc định: 10)' })
  @Get('client/:clientId/chart')
  getWeightChart(
    @Param('clientId') clientId: string, 
    @Query('limit') limit: string,
    @Request() req
  ) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.weightRecordsService.getWeightChart(clientId, req.user.userId, req.user.role, limitNumber);
  }

  @ApiOperation({ summary: 'Lấy chi tiết bản ghi cân nặng' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bản ghi' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.weightRecordsService.findOne(id, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Cập nhật bản ghi cân nặng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateWeightRecordDto: UpdateWeightRecordDto,
    @Request() req
  ) {
    return this.weightRecordsService.update(id, updateWeightRecordDto, req.user.userId, req.user.role);
  }

  @ApiOperation({ summary: 'Xóa bản ghi cân nặng' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.weightRecordsService.remove(id, req.user.userId, req.user.role);
  }
}