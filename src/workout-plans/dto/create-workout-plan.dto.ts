import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class CreateExerciseSetDto {
  @ApiProperty({ example: 10, description: 'Số lần lặp mục tiêu' })
  @IsNumber({}, { message: 'Số lần lặp phải là số' })
  targetReps: number;

  @ApiProperty({ example: 10, required: false, description: 'Số lần lặp thực tế' })
  @IsOptional()
  @IsNumber({}, { message: 'Số lần lặp thực tế phải là số' })
  actualReps?: number;

  @ApiProperty({ example: 20.5, required: false, description: 'Trọng lượng (kg)' })
  @IsOptional()
  @IsNumber({}, { message: 'Trọng lượng phải là số' })
  weightKg?: number;
}

class CreateExerciseDto {
  @ApiProperty({ example: 'Thứ 2', description: 'Tên ngày trong tuần' })
  @IsString()
  @IsNotEmpty({ message: 'Tên ngày không được để trống' })
  dayName: string;

  @ApiProperty({ example: false, description: 'Có phải ngày nghỉ không' })
  @IsBoolean()
  isRestDay: boolean;

  @ApiProperty({ example: 'Push-up', required: false, description: 'Tên bài tập' })
  @IsOptional()
  @IsString()
  exerciseName?: string;

  @ApiProperty({ type: [CreateExerciseSetDto], required: false, description: 'Danh sách sets' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseSetDto)
  sets?: CreateExerciseSetDto[];
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'Kế hoạch tăng cơ tuần 1', description: 'Tên kế hoạch tập luyện' })
  @IsString()
  @IsNotEmpty({ message: 'Tên kế hoạch không được để trống' })
  name: string;

  @ApiProperty({ example: 'clh1234567890', description: 'ID của khách hàng' })
  @IsString()
  @IsNotEmpty({ message: 'ID khách hàng không được để trống' })
  clientId: string;

  @ApiProperty({ example: 1, description: 'Số tuần' })
  @IsNumber({}, { message: 'Số tuần phải là số' })
  weekNumber: number;

  @ApiProperty({ example: '2024-01-01', description: 'Ngày bắt đầu' })
  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ' })
  startDate: string;

  @ApiProperty({ type: [CreateExerciseDto], required: false, description: 'Danh sách bài tập' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  exercises?: CreateExerciseDto[];
}