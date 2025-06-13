import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHomeContentDto {
  @ApiProperty({ example: 'Phi Nguyễn Personal Trainer' })
  @IsString()
  heroTitle: string;

  @ApiProperty({ example: 'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness' })
  @IsString()
  heroSubtitle: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  heroImage?: string;

  @ApiProperty({ example: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness...' })
  @IsString()
  aboutText: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aboutImage?: string;

  @ApiProperty({ example: 'Dịch vụ của tôi' })
  @IsString()
  servicesTitle: string;

  @ApiProperty({ 
    example: ['Tư vấn chế độ tập luyện cá nhân', 'Thiết kế chương trình dinh dưỡng'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}