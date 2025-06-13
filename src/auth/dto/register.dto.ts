import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ 
    example: 'john_doe',
    description: 'Tên đăng nhập (duy nhất)'
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @MaxLength(50, { message: 'Tên đăng nhập không được quá 50 ký tự' })
  username: string;

  @ApiProperty({ 
    example: 'john@example.com',
    description: 'Địa chỉ email (duy nhất)'
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'Mật khẩu (ít nhất 6 ký tự)'
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({ 
    example: 'John Doe',
    description: 'Họ và tên đầy đủ'
  })
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @MaxLength(100, { message: 'Họ và tên không được quá 100 ký tự' })
  fullName: string;

  @ApiProperty({ 
    example: '0123456789',
    required: false,
    description: 'Số điện thoại (tùy chọn)'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.CLIENT,
    description: 'Vai trò người dùng'
  })
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role: UserRole;

  @ApiProperty({ 
    required: false,
    description: 'URL ảnh đại diện (tùy chọn)'
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}