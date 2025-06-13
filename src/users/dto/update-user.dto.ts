import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  username?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  fullName?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  role?: any;

  @IsOptional()
  avatarUrl?: string;
}