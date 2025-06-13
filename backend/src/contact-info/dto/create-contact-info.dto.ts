import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsUrl } from 'class-validator';

export class CreateContactInfoDto {
  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'https://facebook.com/phinpt' })
  @IsUrl()
  @IsNotEmpty()
  facebook: string;

  @ApiProperty({ example: 'https://zalo.me/0123456789' })
  @IsUrl()
  @IsNotEmpty()
  zalo: string;

  @ApiProperty({ example: 'contact@phinpt.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}