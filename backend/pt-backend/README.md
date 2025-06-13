# Personal Trainer Backend API

Backend API cho ứng dụng Personal Trainer được xây dựng bằng NestJS, Prisma và MySQL.

## 🚀 Tính năng

- **Authentication & Authorization**: JWT-based authentication với role-based access control
- **User Management**: Quản lý người dùng (Admin/Client)
- **Workout Plans**: Tạo và quản lý kế hoạch tập luyện
- **Meal Plans**: Quản lý chế độ dinh dưỡng
- **Weight Tracking**: Theo dõi cân nặng
- **Content Management**: Quản lý nội dung trang chủ, testimonials, videos
- **API Documentation**: Swagger UI tự động

## 🛠️ Công nghệ sử dụng

- **Framework**: NestJS
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Development**: Nodemon

## 📋 Yêu cầu hệ thống

- Node.js >= 16
- MySQL >= 8.0
- npm hoặc yarn

## 🔧 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd backend/pt-backend
npm install
```

### 2. Cấu hình database

Tạo file `.env` và cấu hình database:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/pt_database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
CORS_ORIGIN="http://localhost:5173"

# Environment
NODE_ENV="development"
```

### 3. Khởi tạo database

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

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

## 🗄️ Cấu trúc Database

### Bảng chính:

1. **users**: Thông tin người dùng (Admin/Client)
2. **workout_plans**: Kế hoạch tập luyện
3. **workout_days**: Ngày tập trong kế hoạch
4. **exercises**: Bài tập trong ngày
5. **exercise_sets**: Sets của từng bài tập
6. **meal_plans**: Kế hoạch dinh dưỡng
7. **meals**: Bữa ăn trong kế hoạch
8. **meal_foods**: Thực phẩm trong bữa ăn
9. **weight_records**: Bản ghi cân nặng
10. **testimonials**: Phản hồi khách hàng
11. **videos**: Video hướng dẫn
12. **contact_info**: Thông tin liên hệ
13. **home_content**: Nội dung trang chủ

## 🔐 Authentication

### Đăng ký Admin:
```bash
POST /auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

### Đăng nhập:
```bash
POST /auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Tài khoản mặc định (sau khi seed):
- **Admin**: username: `admin`, password: `admin123`
- **Client**: username: `client_demo`, password: `client123`

## 📖 API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập

### Users
- `GET /users` - Lấy danh sách người dùng (Admin only)
- `GET /users/:id` - Lấy thông tin người dùng
- `PATCH /users/:id` - Cập nhật thông tin
- `DELETE /users/:id` - Xóa người dùng (Admin only)

### Workout Plans
- `GET /workout-plans` - Lấy danh sách kế hoạch tập
- `GET /workout-plans?clientId=:id` - Lấy kế hoạch theo client
- `POST /workout-plans` - Tạo kế hoạch mới (Admin only)
- `PATCH /workout-plans/:id` - Cập nhật kế hoạch
- `DELETE /workout-plans/:id` - Xóa kế hoạch (Admin only)
- `POST /workout-plans/:id/duplicate` - Duplicate kế hoạch (Admin only)

### Meal Plans
- `GET /meal-plans` - Lấy danh sách kế hoạch dinh dưỡng
- `GET /meal-plans?clientId=:id` - Lấy kế hoạch theo client
- `POST /meal-plans` - Tạo kế hoạch mới (Admin only)
- `PATCH /meal-plans/:id` - Cập nhật kế hoạch
- `DELETE /meal-plans/:id` - Xóa kế hoạch (Admin only)

### Weight Records
- `GET /weight-records` - Lấy bản ghi cân nặng
- `GET /weight-records?clientId=:id` - Lấy bản ghi theo client
- `POST /weight-records` - Thêm bản ghi mới
- `PATCH /weight-records/:id` - Cập nhật bản ghi
- `DELETE /weight-records/:id` - Xóa bản ghi

### Content Management
- `GET /testimonials` - Lấy testimonials
- `POST /testimonials` - Thêm testimonial (Admin only)
- `GET /videos` - Lấy videos
- `POST /videos` - Thêm video (Admin only)
- `GET /contact-info/current` - Lấy thông tin liên hệ hiện tại
- `PATCH /contact-info/current/update` - Cập nhật thông tin liên hệ (Admin only)
- `GET /home-content/current` - Lấy nội dung trang chủ hiện tại
- `PATCH /home-content/current/update` - Cập nhật nội dung trang chủ (Admin only)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Scripts

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
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Mở Prisma Studio
npm run seed               # Seed database

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier
```

## 🔧 Prisma Commands

```bash
# Xem database trong Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate client sau khi thay đổi schema
npx prisma generate
```

## 🚀 Deployment

### Production Build:
```bash
npm run build
npm run start:prod
```

### Environment Variables cho Production:
```env
NODE_ENV=production
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="your-production-secret"
PORT=3001
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trên GitHub repository.