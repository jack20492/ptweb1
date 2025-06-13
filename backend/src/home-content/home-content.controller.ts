import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeContentService } from './home-content.service';
import { CreateHomeContentDto } from './dto/create-home-content.dto';
import { UpdateHomeContentDto } from './dto/update-home-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Home Content')
@Controller('home-content')
export class HomeContentController {
  constructor(private readonly homeContentService: HomeContentService) {}

  @ApiOperation({ summary: 'Create home content' })
  @ApiResponse({ status: 201, description: 'Home content created successfully' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: 'Get latest home content' })
  @ApiResponse({ status: 200, description: 'Latest home content retrieved successfully' })
  @Get('latest')
  findLatest() {
    return this.homeContentService.findLatest();
  }

  @ApiOperation({ summary: 'Get home content by ID' })
  @ApiResponse({ status: 200, description: 'Home content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Home content not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeContentService.findOne(id);
  }

  @ApiOperation({ summary: 'Update home content' })
  @ApiResponse({ status: 200, description: 'Home content updated successfully' })
  @ApiResponse({ status: 404, description: 'Home content not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomeContentDto: UpdateHomeContentDto) {
    return this.homeContentService.update(id, updateHomeContentDto);
  }

  @ApiOperation({ summary: 'Delete home content' })
  @ApiResponse({ status: 200, description: 'Home content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Home content not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homeContentService.remove(id);
  }
}