import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ example: 'How to do Push-ups Correctly' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'dQw4w9WgXcQ' })
  @IsString()
  @IsNotEmpty()
  youtubeId: string;

  @ApiProperty({ example: 'Learn the proper form for push-ups to maximize effectiveness and prevent injury.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Strength' })
  @IsString()
  @IsNotEmpty()
  category: string;
}