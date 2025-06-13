import { IsString, IsOptional, IsInt, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MacroType } from '@prisma/client';

class CreateMealFoodDto {
  @ApiProperty({ example: 'Chicken Breast' })
  @IsString()
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

  @ApiProperty({ example: 0 })
  @IsInt()
  foodOrder: number;
}

class CreateMealDto {
  @ApiProperty({ example: 'Breakfast' })
  @IsString()
  name: string;

  @ApiProperty({ example: 500 })
  @IsInt()
  totalCalories: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  mealOrder: number;

  @ApiProperty({ type: [CreateMealFoodDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealFoodDto)
  foods: CreateMealFoodDto[];
}

export class CreateMealPlanDto {
  @ApiProperty({ example: 'Weight Loss Meal Plan' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'client-id-here' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: 1500 })
  @IsInt()
  totalCalories: number;

  @ApiProperty({ example: 'Follow this plan for 4 weeks', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateMealDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealDto)
  meals: CreateMealDto[];
}