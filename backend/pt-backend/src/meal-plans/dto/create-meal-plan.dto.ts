import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { MacroType } from '@prisma/client';

class CreateMealFoodDto {
  @ApiProperty({ example: 'Chicken Breast' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: MacroType, example: MacroType.PRO })
  @IsEnum(MacroType)
  macroType: MacroType;

  @ApiProperty({ example: 200 })
  @IsInt()
  calories: number;

  @ApiProperty({ example: 'Grilled', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

class CreateMealDto {
  @ApiProperty({ example: 'Breakfast' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 400 })
  @IsInt()
  totalCalories: number;

  @ApiProperty({ type: [CreateMealFoodDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealFoodDto)
  foods: CreateMealFoodDto[];
}

export class CreateMealPlanDto {
  @ApiProperty({ example: 'Weight Loss Plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'client-id-here' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 1500 })
  @IsInt()
  totalCalories: number;

  @ApiProperty({ example: 'Low carb diet plan', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateMealDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealDto)
  meals: CreateMealDto[];
}