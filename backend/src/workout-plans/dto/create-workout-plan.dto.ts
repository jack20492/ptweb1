import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsArray, ValidateNested } from 'class-validator';
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

class CreateExerciseDto {
  @ApiProperty({ example: 'Push ups' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Monday' })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({ example: false })
  @IsOptional()
  isRestDay?: boolean;

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

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'Week 1 - Upper Body' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'client-id-123' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'trainer-id-123', required: false })
  @IsOptional()
  @IsString()
  trainerId?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  weekNumber?: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: 'admin' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ type: [CreateExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises: CreateExerciseDto[];
}