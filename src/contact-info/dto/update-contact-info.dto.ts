import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsUrl } from 'class-validator';

export class UpdateContactInfoDto {
  @ApiProperty({ example: '0123456789', description: 'Số điện thoại' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @ApiProperty({ example: 'https://facebook.com/phinpt', description: 'URL Facebook' })
  @IsString()
  @IsNotEmpty({ message: 'URL Facebook không được để trống' })
  @IsUrl({}, { message: 'URL Facebook không hợp lệ' })
  facebookUrl: string;

  @ApiProperty({ example: 'https://zalo.me/0123456789', description: 'URL Zalo' })
  @IsString()
  @IsNotEmpty({ message: 'URL Zalo không được để trống' })
  @IsUrl({}, { message: 'URL Zalo không hợp lệ' })
  zaloUrl: string;

  @ApiProperty({ example: 'contact@phinpt.com', description: 'Địa chỉ email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;
}