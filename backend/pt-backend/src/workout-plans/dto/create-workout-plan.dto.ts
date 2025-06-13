import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested, IsBoolean, IsNumber } from 'class-validator';
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
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: 200, required: false })
  @IsOptional()
  @IsNumber()
  volume?: number;
}

class CreateExerciseDto {
  @ApiProperty({ example: 'Push-ups' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [CreateExerciseSetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseSetDto)
  sets: CreateExerciseSetDto[];
}

class CreateWorkoutDayDto {
  @ApiProperty({ example: 'Monday' })
  @IsString()
  @IsNotEmpty()
  day: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isRestDay: boolean;

  @ApiProperty({ type: [CreateExerciseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises?: CreateExerciseDto[];
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'Beginner Workout Plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'client-id-here' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  weekNumber: number;

  @ApiProperty({ example: 'admin-id-here', required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ type: [CreateWorkoutDayDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutDayDto)
  days: CreateWorkoutDayDto[];
}