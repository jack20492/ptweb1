import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Is Optional, IsBoolean } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ example: 'Bài tập cardio cơ bản tại nhà', description: 'Tiêu đề video' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề video không được để trống' })
  title: string;

  @ApiProperty({ example: 'dQw4w9WgXcQ', description: 'YouTube Video ID' })
  @IsString()
  @IsNotEmpty({ message: 'YouTube ID không được để trống' })
  youtubeId: string;

  @ApiProperty({ 
    example: 'Hướng dẫn các bài tập cardio đơn giản có thể thực hiện tại nhà', 
    description: 'Mô tả video' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Mô tả video không được để trống' })
  description: string;

  @ApiProperty({ example: 'Cardio', description: 'Danh mục video' })
  @IsString()
  @IsNotEmpty({ message: 'Danh mục không được để trống' })
  category: string;

  @ApiProperty({ example: true, required: false, description: 'Trạng thái xuất bản' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}