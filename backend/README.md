# Personal Trainer Backend API

Backend API cho ứng dụng Personal Trainer được xây dựng với NestJS, Prisma và MySQL.

## 🚀 Tính năng

- **Authentication & Authorization**: JWT-based với role-based access control
- **Database**: MySQL với Prisma ORM
- **API Documentation**: Swagger UI
- **Validation**: Class-validator cho input validation
- **Hot Reload**: Nodemon cho development

## 📋 Yêu cầu hệ thống

- Node.js >= 16
- MySQL >= 8.0
- npm hoặc yarn

## 🛠️ Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật thông tin database trong `.env`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/pt_database"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Thiết lập database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database với dữ liệu mẫu
npm run seed
```

### 4. Chạy ứng dụng

```bash
# Development mode với hot-reload
npm run start:dev

# Production mode
npm run start:prod
```

## 📚 API Documentation

Sau khi chạy ứng dụng, truy cập Swagger UI tại:
- **Local**: http://localhost:3001/api
- **API Base URL**: http://localhost:3001

## 🔐 Authentication

### Đăng nhập với tài khoản mặc định:

**Admin:**
- Username: `admin`
- Password: `admin123`

**Client:**
- Username: `client1`
- Password: `client123`

### Sử dụng JWT Token:

1. Đăng nhập qua `/auth/login` để nhận token
2. Thêm header: `Authorization: Bearer <token>`
3. Hoặc sử dụng "Authorize" button trong Swagger UI

## 📊 Database Schema

### Entities chính:

- **Users**: Quản lý người dùng (admin/client)
- **WorkoutPlans**: Kế hoạch tập luyện
- **Exercises**: Bài tập trong kế hoạch
- **ExerciseSets**: Sets của từng bài tập
- **MealPlans**: Kế hoạch dinh dưỡng
- **Meals**: Bữa ăn trong kế hoạch
- **MealFoods**: Thực phẩm trong bữa ăn
- **WeightRecords**: Ghi nhận cân nặng
- **Testimonials**: Phản hồi khách hàng
- **Videos**: Video hướng dẫn
- **ContactInfo**: Thông tin liên hệ
- **HomeContent**: Nội dung trang chủ

## 🛡️ Security

- **JWT Authentication**: Bảo mật API endpoints
- **Role-based Access**: Admin và Client có quyền khác nhau
- **Input Validation**: Validate tất cả input data
- **CORS**: Cấu hình CORS cho frontend

## 🔧 Scripts

```bash
# Development
npm run start:dev          # Chạy với hot-reload
npm run start:debug        # Chạy với debug mode

# Build & Production
npm run build              # Build ứng dụng
npm run start:prod         # Chạy production

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:push        # Push schema to DB
npm run prisma:migrate     # Tạo migration
npm run prisma:studio      # Mở Prisma Studio
npm run seed               # Seed database

# Testing
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Test coverage

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier
```

## 📁 Cấu trúc project

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding
├── src/
│   ├── auth/             # Authentication module
│   ├── users/            # Users management
│   ├── workout-plans/    # Workout plans
│   ├── exercises/        # Exercises
│   ├── meal-plans/       # Meal plans
│   ├── weight-records/   # Weight tracking
│   ├── testimonials/     # Testimonials
│   ├── videos/           # Videos
│   ├── contact-info/     # Contact info
│   ├── home-content/     # Home content
│   ├── prisma/           # Prisma service
│   ├── app.module.ts     # Main app module
│   └── main.ts           # Application entry point
├── .env                  # Environment variables
├── .env.example          # Environment template
└── README.md
```

## 🐛 Troubleshooting

### Database connection issues:
1. Kiểm tra MySQL server đang chạy
2. Xác nhận thông tin connection trong `.env`
3. Đảm bảo database đã được tạo

### Port conflicts:
- Backend mặc định chạy trên port 3001
- Thay đổi PORT trong `.env` nếu cần

### Prisma issues:
```bash
# Reset database
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong console
2. Xem Swagger documentation tại `/api`
3. Kiểm tra file `.env` configuration
```