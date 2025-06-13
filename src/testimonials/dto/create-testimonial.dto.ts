import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên khách hàng' })
  @IsString()
  @IsNotEmpty({ message: 'Tên khách hàng không được để trống' })
  name: string;

  @ApiProperty({ 
    example: 'Tôi đã giảm được 10kg sau 3 tháng tập với PT Phi. Rất hài lòng!', 
    description: 'Nội dung phản hồi' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống' })
  content: string;

  @ApiProperty({ example: 5, description: 'Đánh giá (1-5 sao)' })
  @IsNumber({}, { message: 'Đánh giá phải là số' })
  @Min(1, { message: 'Đánh giá tối thiểu là 1 sao' })
  @Max(5, { message: 'Đánh giá tối đa là 5 sao' })
  rating: number;

  @ApiProperty({ 
    example: 'https://example.com/avatar.jpg', 
    required: false, 
    description: 'URL ảnh đại diện' 
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ 
    example: 'https://example.com/before.jpg', 
    required: false, 
    description: 'URL ảnh trước khi tập' 
  })
  @IsOptional()
  @IsString()
  beforeImageUrl?: string;

  @ApiProperty({ 
    example: 'https://example.com/after.jpg', 
    required: false, 
    description: 'URL ảnh sau khi tập' 
  })
  @IsOptional()
  @IsString()
  afterImageUrl?: string;

  @ApiProperty({ example: true, required: false, description: 'Trạng thái xuất bản' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}