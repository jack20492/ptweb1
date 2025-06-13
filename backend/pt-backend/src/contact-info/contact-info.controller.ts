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
import { ContactInfoService } from './contact-info.service';
import { CreateContactInfoDto } from './dto/create-contact-info.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Contact Info')
@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create contact info (Admin only)' })
  @ApiResponse({ status: 201, description: 'Contact info created successfully' })
  create(@Body() createContactInfoDto: CreateContactInfoDto) {
    return this.contactInfoService.create(createContactInfoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact info (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact info retrieved successfully' })
  findAll() {
    return this.contactInfoService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current contact info (Public)' })
  @ApiResponse({ status: 200, description: 'Current contact info retrieved successfully' })
  findCurrent() {
    return this.contactInfoService.findCurrent();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact info by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact info retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  findOne(@Param('id') id: string) {
    return this.contactInfoService.findOne(id);
  }

  @Patch('current')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current contact info (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact info updated successfully' })
  updateCurrent(@Body() updateContactInfoDto: UpdateContactInfoDto) {
    return this.contactInfoService.updateCurrent(updateContactInfoDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact info (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact info updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  update(@Param('id') id: string, @Body() updateContactInfoDto: UpdateContactInfoDto) {
    return this.contactInfoService.update(id, updateContactInfoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact info (Admin only)' })
  @ApiResponse({ status: 200, description: 'Contact info deleted successfully' })
  @ApiResponse({ status: 404, description: 'Contact info not found' })
  remove(@Param('id') id: string) {
    return this.contactInfoService.remove(id);
  }
}