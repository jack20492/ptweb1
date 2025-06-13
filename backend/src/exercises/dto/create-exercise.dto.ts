import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateExerciseSetDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  setNumber: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  reps: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  reality?: number;

  @ApiProperty({ example: 20.5, required: false })
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: 200, required: false })
  @IsOptional()
  volume?: number;
}

export class CreateExerciseDto {
  @ApiProperty({ example: 'workout-plan-id-123' })
  @IsString()
  @IsNotEmpty()
  workoutPlanId: string;

  @ApiProperty({ example: 'Monday' })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isRestDay?: boolean;

  @ApiProperty({ example: 'Push ups', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: [CreateExerciseSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseSetDto)
  sets: CreateExerciseSetDto[];
}