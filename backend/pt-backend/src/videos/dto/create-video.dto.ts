import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ example: 'How to do Push-ups' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'dQw4w9WgXcQ' })
  @IsString()
  youtubeId: string;

  @ApiProperty({ example: 'Learn the proper form for push-ups' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Strength', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}