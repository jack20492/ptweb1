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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WeightRecordsService } from './weight-records.service';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';
import { UpdateWeightRecordDto } from './dto/update-weight-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Weight Records')
@Controller('weight-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WeightRecordsController {
  constructor(private readonly weightRecordsService: WeightRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new weight record' })
  @ApiResponse({ status: 201, description: 'Weight record created successfully' })
  create(@Body() createWeightRecordDto: CreateWeightRecordDto, @Request() req) {
    return this.weightRecordsService.create(createWeightRecordDto, req.user.id, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all weight records' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Weight records retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('clientId') clientId?: string,
    @Request() req?,
  ) {
    return this.weightRecordsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      req.user.id,
      req.user.role,
      clientId,
    );
  }

  @Get('chart/:clientId')
  @ApiOperation({ summary: 'Get weight chart data for a client' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Weight chart data retrieved successfully' })
  getWeightChart(
    @Param('clientId') clientId: string,
    @Query('limit') limit?: string,
    @Request() req?,
  ) {
    return this.weightRecordsService.getWeightChart(
      clientId,
      req.user.id,
      req.user.role,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get weight record by ID' })
  @ApiResponse({ status: 200, description: 'Weight record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Weight record not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.weightRecordsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update weight record' })
  @ApiResponse({ status: 200, description: 'Weight record updated successfully' })
  @ApiResponse({ status: 404, description: 'Weight record not found' })
  update(
    @Param('id') id: string,
    @Body() updateWeightRecordDto: UpdateWeightRecordDto,
    @Request() req,
  ) {
    return this.weightRecordsService.update(id, updateWeightRecordDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete weight record' })
  @ApiResponse({ status: 200, description: 'Weight record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Weight record not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.weightRecordsService.remove(id, req.user.id, req.user.role);
  }
}