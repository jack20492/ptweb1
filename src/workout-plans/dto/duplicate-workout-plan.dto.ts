import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DuplicateWorkoutPlanDto {
  @ApiProperty({ example: 'clh1234567890', description: 'ID của khách hàng sẽ nhận kế hoạch sao chép' })
  @IsString()
  @IsNotEmpty({ message: 'ID khách hàng không được để trống' })
  clientId: string;
}