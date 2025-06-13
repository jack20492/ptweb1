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

@ApiTags('contact-info')
@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) {}

  @ApiOperation({ summary: 'Create contact info' })
  @ApiResponse({ status: 201, description: 'Contact info created successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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

  @ApiOperation({ summary: 'Get current contact info' })
  @ApiResponse({ status: 200, description: 'Current contact info retrieved successfully' })
  @Get('current')
  findCurrent() {
    return this.contactInfoService.findCurrent();
  }

  @ApiOperation({ summary: 'Get contact info by ID' })
  @ApiResponse({ status: 200, description: 'Contact info retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactInfoService.findOne(id);
  }

  @ApiOperation({ summary: 'Update contact info' })
  @ApiResponse({ status: 200, description: 'Contact info updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactInfoDto: UpdateContactInfoDto) {
    return this.contactInfoService.update(id, updateContactInfoDto);
  }

  @ApiOperation({ summary: 'Update current contact info' })
  @ApiResponse({ status: 200, description: 'Current contact info updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('current/update')
  updateCurrent(@Body() updateContactInfoDto: UpdateContactInfoDto) {
    return this.contactInfoService.updateCurrent(updateContactInfoDto);
  }

  @ApiOperation({ summary: 'Delete contact info' })
  @ApiResponse({ status: 200, description: 'Contact info deleted successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactInfoService.remove(id);
  }
}