import { IsString, IsOptional, IsInt, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 50.5, required: false })
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: 505, required: false })
  @IsOptional()
  volume?: number;
}

class CreateExerciseDto {
  @ApiProperty({ example: 'Push-ups' })
  @IsString()
  name: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  exerciseOrder: number;

  @ApiProperty({ type: [CreateExerciseSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseSetDto)
  sets: CreateExerciseSetDto[];
}

class CreateWorkoutDayDto {
  @ApiProperty({ example: 'Monday' })
  @IsString()
  day: string;

  @ApiProperty({ example: false })
  @IsOptional()
  isRestDay?: boolean;

  @ApiProperty({ example: 0 })
  @IsInt()
  dayOrder: number;

  @ApiProperty({ type: [CreateExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises: CreateExerciseDto[];
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'Beginner Workout Plan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'client-id-here' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: 'trainer-id-here', required: false })
  @IsOptional()
  @IsString()
  trainerId?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  weekNumber: number;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: 'admin' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ type: [CreateWorkoutDayDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDayDto)
  days: CreateWorkoutDayDto[];
}