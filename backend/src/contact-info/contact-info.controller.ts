import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContactInfoService } from './contact-info.service';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Contact Info')
@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @ApiOperation({ summary: 'Create contact info' })
  @ApiResponse({ status: 201, description: 'Contact info created successfully' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createContactInfoDto: CreateContactInfoDto) {
    return this.contactInfoService.create(createContactInfoDto);
  }

  @ApiOperation({ summary: 'Get all contact info' })
  @ApiResponse({ status: 200, description: 'Contact info retrieved successfully' })
  @Get()
  findAll() {
    return this.contactInfoService.findAll();
  }

  @ApiOperation({ summary: 'Get latest contact info' })
  @ApiResponse({ status: 200, description: 'Latest contact info retrieved successfully' })
  @Get('latest')
  findLatest() {
    return this.contactInfoService.findLatest();
  }

  @ApiOperation({ summary: 'Get contact info by ID' })
  @ApiResponse({ status: 200, description: 'Contact info retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactInfoService.findOne(id);
  }

  @ApiOperation({ summary: 'Update contact info' })
  @ApiResponse({ status: 200, description: 'Contact info updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactInfoDto: UpdateContactInfoDto) {
    return this.contactInfoService.update(id, updateContactInfoDto);
  }

  @ApiOperation({ summary: 'Delete contact info' })
  @ApiResponse({ status: 200, description: 'Contact info deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactInfoService.remove(id);
  }
}