import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Great trainer, helped me achieve my goals!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'https://example.com/before.jpg', required: false })
  @IsOptional()
  @IsString()
  beforeImage?: string;

  @ApiProperty({ example: 'https://example.com/after.jpg', required: false })
  @IsOptional()
  @IsString()
  afterImage?: string;
}