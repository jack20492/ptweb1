import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateExerciseSetDto {
  @ApiProperty({ example: 12, required: false, description: 'Số lần lặp thực tế' })
  @IsOptional()
  @IsNumber({}, { message: 'Số lần lặp thực tế phải là số' })
  @Min(0, { message: 'Số lần lặp thực tế phải lớn hơn hoặc bằng 0' })
  actualReps?: number;

  @ApiProperty({ example: 25.5, required: false, description: 'Trọng lượng (kg)' })
  @IsOptional()
  @IsNumber({}, { message: 'Trọng lượng phải là số' })
  @Min(0, { message: 'Trọng lượng phải lớn hơn hoặc bằng 0' })
  weightKg?: number;
}