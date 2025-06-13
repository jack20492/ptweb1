import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { MacroType } from '@prisma/client';

class CreateMealFoodDto {
  @ApiProperty({ example: 'Cơm trắng', description: 'Tên thực phẩm' })
  @IsString()
  @IsNotEmpty({ message: 'Tên thực phẩm không được để trống' })
  name: string;

  @ApiProperty({ enum: MacroType, example: MacroType.CARB, description: 'Loại macro' })
  @IsEnum(MacroType, { message: 'Loại macro không hợp lệ' })
  macroType: MacroType;

  @ApiProperty({ example: 150, description: 'Số calories' })
  @IsNumber({}, { message: 'Số calories phải là số' })
  calories: number;

  @ApiProperty({ example: 'Ăn vào buổi sáng', required: false, description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateMealDto {
  @ApiProperty({ example: 'Bữa sáng', description: 'Tên bữa ăn' })
  @IsString()
  @IsNotEmpty({ message: 'Tên bữa ăn không được để trống' })
  name: string;

  @ApiProperty({ type: [CreateMealFoodDto], description: 'Danh sách thực phẩm' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealFoodDto)
  foods: CreateMealFoodDto[];
}

export class CreateMealPlanDto {
  @ApiProperty({ example: 'Kế hoạch dinh dưỡng giảm cân', description: 'Tên kế hoạch dinh dưỡng' })
  @IsString()
  @IsNotEmpty({ message: 'Tên kế hoạch không được để trống' })
  name: string;

  @ApiProperty({ example: 'clh1234567890', description: 'ID của khách hàng' })
  @IsString()
  @IsNotEmpty({ message: 'ID khách hàng không được để trống' })
  clientId: string;

  @ApiProperty({ example: 'Uống nhiều nước, ăn chậm', required: false, description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateMealDto], description: 'Danh sách bữa ăn' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealDto)
  meals: CreateMealDto[];
}