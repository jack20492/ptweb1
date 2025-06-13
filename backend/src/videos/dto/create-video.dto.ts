import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ example: 'How to do proper push-ups' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'dQw4w9WgXcQ' })
  @IsString()
  @IsNotEmpty()
  youtubeId: string;

  @ApiProperty({ example: 'Learn the correct form for push-ups to maximize effectiveness and prevent injury.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Strength' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}