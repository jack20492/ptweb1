import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('Tên đăng nhập hoặc email đã tồn tại');
    }

    return this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        startDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(userRole: UserRole) {
    // Only admins can see all users
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể xem danh sách người dùng');
    }

    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        startDate: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        startDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string, currentUserRole: UserRole) {
    const user = await this.findOne(id);
    
    // Users can only update their own profile, admins can update anyone
    if (currentUserRole !== UserRole.ADMIN && id !== currentUserId) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật thông tin của chính mình');
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        startDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, currentUserRole: UserRole) {
    // Only admins can delete users
    if (currentUserRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ admin mới có thể xóa người dùng');
    }

    const user = await this.findOne(id);
    
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findClients() {
    return this.prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        startDate: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
  }

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalClients = await this.prisma.user.count({
      where: { role: UserRole.CLIENT },
    });
    const totalAdmins = await this.prisma.user.count({
      where: { role: UserRole.ADMIN },
    });

    return {
      totalUsers,
      totalClients,
      totalAdmins,
    };
  }
}