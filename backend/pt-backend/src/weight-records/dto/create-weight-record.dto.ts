import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateWeightRecordDto {
  @ApiProperty({ example: 'client-id-here' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 70.5 })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Morning weight after workout', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}