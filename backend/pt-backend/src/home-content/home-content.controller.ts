import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeContentService } from './home-content.service';
import { CreateHomeContentDto } from './dto/create-home-content.dto';
import { UpdateHomeContentDto } from './dto/update-home-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('home-content')
@Controller('home-content')
export class HomeContentController {
  constructor(private readonly homeContentService: HomeContentService) {}

  @ApiOperation({ summary: 'Create home content' })
  @ApiResponse({ status: 201, description: 'Home content created successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createHomeContentDto: CreateHomeContentDto) {
    return this.homeContentService.create(createHomeContentDto);
  }

  @ApiOperation({ summary: 'Get all home content' })
  @ApiResponse({ status: 200, description: 'Home content retrieved successfully' })
  @Get()
  findAll() {
    return this.homeContentService.findAll();
  }

  @ApiOperation({ summary: 'Get current home content' })
  @ApiResponse({ status: 200, description: 'Current home content retrieved successfully' })
  @Get('current')
  findCurrent() {
    return this.homeContentService.findCurrent();
  }

  @ApiOperation({ summary: 'Get home content by ID' })
  @ApiResponse({ status: 200, description: 'Home content retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeContentService.findOne(id);
  }

  @ApiOperation({ summary: 'Update home content' })
  @ApiResponse({ status: 200, description: 'Home content updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomeContentDto: UpdateHomeContentDto) {
    return this.homeContentService.update(id, updateHomeContentDto);
  }

  @ApiOperation({ summary: 'Update current home content' })
  @ApiResponse({ status: 200, description: 'Current home content updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('current/update')
  updateCurrent(@Body() updateHomeContentDto: UpdateHomeContentDto) {
    return this.homeContentService.updateCurrent(updateHomeContentDto);
  }

  @ApiOperation({ summary: 'Delete home content' })
  @ApiResponse({ status: 200, description: 'Home content deleted successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homeContentService.remove(id);
  }
}