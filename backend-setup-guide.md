# 🚀 Hướng dẫn tạo Backend NestJS hoàn chỉnh cho Personal Trainer

## Bước 1: Khởi tạo project và cài đặt dependencies

```bash
# Tạo project NestJS mới
nest new pt-backend
cd pt-backend

# Cài đặt dependencies chính
npm install @prisma/client prisma
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install bcryptjs class-validator class-transformer
npm install @nestjs/config
npm install mysql2

# Cài đặt dev dependencies
npm install -D @types/bcryptjs @types/passport-jwt @types/passport-local
npm install -D nodemon ts-node

# Khởi tạo Prisma
npx prisma init
```

## Bước 2: Cấu hình môi trường

Tạo file `.env`:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/pt_database"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
JWT_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development
```

## Bước 3: Tạo tất cả các file code

### 3.1 Prisma Schema