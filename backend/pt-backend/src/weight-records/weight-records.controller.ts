import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WeightRecordsService } from './weight-records.service';
import { CreateWeightRecordDto } from './dto/create-weight-record.dto';
import { UpdateWeightRecordDto } from './dto/update-weight-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('weight-records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('weight-records')
export class WeightRecordsController {
  constructor(private readonly weightRecordsService: WeightRecordsService) {}

  @ApiOperation({ summary: 'Create a new weight record' })
  @ApiResponse({ status: 201, description: 'Weight record created successfully' })
  @Post()
  create(@Body() createWeightRecordDto: CreateWeightRecordDto) {
    return this.weightRecordsService.create(createWeightRecordDto);
  }

  @ApiOperation({ summary: 'Get all weight records' })
  @ApiResponse({ status: 200, description: 'Weight records retrieved successfully' })
  @Get()
  findAll(@Query('clientId') clientId?: string) {
    if (clientId) {
      return this.weightRecordsService.findByClient(clientId);
    }
    return this.weightRecordsService.findAll();
  }

  @ApiOperation({ summary: 'Get weight record by ID' })
  @ApiResponse({ status: 200, description: 'Weight record retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weightRecordsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update weight record' })
  @ApiResponse({ status: 200, description: 'Weight record updated successfully' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeightRecordDto: UpdateWeightRecordDto) {
    return this.weightRecordsService.update(id, updateWeightRecordDto);
  }

  @ApiOperation({ summary: 'Delete weight record' })
  @ApiResponse({ status: 200, description: 'Weight record deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weightRecordsService.remove(id);
  }
}