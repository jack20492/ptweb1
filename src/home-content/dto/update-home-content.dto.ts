import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UpdateHomeContentDto {
  @ApiProperty({ example: 'Phi Nguyễn Personal Trainer', description: 'Tiêu đề hero section' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề hero không được để trống' })
  heroTitle: string;

  @ApiProperty({ 
    example: 'Chuyên gia huấn luyện cá nhân - Giúp bạn đạt được mục tiêu fitness', 
    description: 'Phụ đề hero section' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Phụ đề hero không được để trống' })
  heroSubtitle: string;

  @ApiProperty({ 
    example: 'https://example.com/hero-image.jpg', 
    required: false, 
    description: 'URL ảnh hero section' 
  })
  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @ApiProperty({ 
    example: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực fitness...', 
    description: 'Nội dung phần giới thiệu' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung giới thiệu không được để trống' })
  aboutText: string;

  @ApiProperty({ 
    example: 'https://example.com/about-image.jpg', 
    required: false, 
    description: 'URL ảnh phần giới thiệu' 
  })
  @IsOptional()
  @IsString()
  aboutImageUrl?: string;

  @ApiProperty({ example: 'Dịch vụ của tôi', description: 'Tiêu đề phần dịch vụ' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề dịch vụ không được để trống' })
  servicesTitle: string;

  @ApiProperty({ 
    example: [
      'Tư vấn chế độ tập luyện cá nhân',
      'Thiết kế chương trình dinh dưỡng',
      'Theo dõi tiến độ và điều chỉnh'
    ], 
    description: 'Danh sách dịch vụ' 
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}