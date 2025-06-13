import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateHomeContentDto {
  @ApiProperty({ example: 'Phi Nguyễn Personal Trainer' })
  @IsString()
  @IsNotEmpty()
  heroTitle: string;

  @ApiProperty({ example: 'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness' })
  @IsString()
  @IsNotEmpty()
  heroSubtitle: string;

  @ApiProperty({ example: 'https://example.com/hero.jpg', required: false })
  @IsOptional()
  @IsString()
  heroImage?: string;

  @ApiProperty({ example: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness...' })
  @IsString()
  @IsNotEmpty()
  aboutText: string;

  @ApiProperty({ example: 'https://example.com/about.jpg', required: false })
  @IsOptional()
  @IsString()
  aboutImage?: string;

  @ApiProperty({ example: 'Dịch vụ của tôi' })
  @IsString()
  @IsNotEmpty()
  servicesTitle: string;

  @ApiProperty({ 
    example: ['Tư vấn chế độ tập luyện cá nhân', 'Thiết kế chương trình dinh dưỡng'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}