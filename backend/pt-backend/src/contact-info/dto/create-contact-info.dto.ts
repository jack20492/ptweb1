import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactInfoDto {
  @ApiProperty({ example: '0123456789' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'https://facebook.com/phinpt' })
  @IsString()
  facebookUrl: string;

  @ApiProperty({ example: 'https://zalo.me/0123456789' })
  @IsString()
  zaloUrl: string;

  @ApiProperty({ example: 'contact@phinpt.com' })
  @IsEmail()
  email: string;
}