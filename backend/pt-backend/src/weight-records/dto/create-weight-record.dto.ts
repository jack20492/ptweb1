import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWeightRecordDto {
  @ApiProperty({ example: 'client-id-here' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: 75.5 })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Feeling good today', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}