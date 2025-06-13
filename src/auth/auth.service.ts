import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsernameOrEmail(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      email: user.email,
      fullName: user.fullName
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user,
      message: 'Đăng nhập thành công'
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByUsernameOrEmail(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Tên đăng nhập hoặc email đã tồn tại');
    }

    const existingEmail = await this.usersService.findByUsernameOrEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const { password, ...result } = user;
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      email: user.email,
      fullName: user.fullName
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
      message: 'Đăng ký thành công'
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findOne(userId);
  }
}