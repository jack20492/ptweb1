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

@ApiTags('Home Content')
@Controller('home-content')
export class HomeContentController {
  constructor(private readonly homeContentService: HomeContentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create home content (Admin only)' })
  @ApiResponse({ status: 201, description: 'Home content created successfully' })
  create(@Body() createHomeContentDto: CreateHomeContentDto) {
    return this.homeContentService.create(createHomeContentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all home content (Admin only)' })
  @ApiResponse({ status: 200, description: 'Home content retrieved successfully' })
  findAll() {
    return this.homeContentService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current home content (Public)' })
  @ApiResponse({ status: 200, description: 'Current home content retrieved successfully' })
  findCurrent() {
    return this.homeContentService.findCurrent();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get home content by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Home content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Home content not found' })
  findOne(@Param('id') id: string) {
    return this.homeContentService.findOne(id);
  }

  @Patch('current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current home content (Admin only)' })
  @ApiResponse({ status: 200, description: 'Home content updated successfully' })
  updateCurrent(@Body() updateHomeContentDto: UpdateHomeContentDto) {
    return this.homeContentService.updateCurrent(updateHomeContentDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update home content (Admin only)' })
  @ApiResponse({ status: 200, description: 'Home content updated successfully' })
  @ApiResponse({ status: 404, description: 'Home content not found' })
  update(@Param('id') id: string, @Body() updateHomeContentDto: UpdateHomeContentDto) {
    return this.homeContentService.update(id, updateHomeContentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete home content (Admin only)' })
  @ApiResponse({ status: 200, description: 'Home content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Home content not found' })
  remove(@Param('id') id: string) {
    return this.homeContentService.remove(id);
  }
}