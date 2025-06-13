import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateWeightRecordDto {
  @ApiProperty({ example: 'clh1234567890', description: 'ID của khách hàng' })
  @IsString()
  @IsNotEmpty({ message: 'ID khách hàng không được để trống' })
  clientId: string;

  @ApiProperty({ example: 70.5, description: 'Cân nặng (kg)' })
  @IsNumber({}, { message: 'Cân nặng phải là số' })
  @Min(0, { message: 'Cân nặng phải lớn hơn 0' })
  weightKg: number;

  @ApiProperty({ example: '2024-01-01', description: 'Ngày ghi nhận' })
  @IsDateString({}, { message: 'Ngày ghi nhận không hợp lệ' })
  recordDate: string;

  @ApiProperty({ example: 'Cân nặng sau bữa sáng', required: false, description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;
}