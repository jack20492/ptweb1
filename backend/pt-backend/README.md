# Personal Trainer Backend API

A comprehensive NestJS backend for a Personal Trainer management system with authentication, workout plans, meal plans, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin and client user roles
- **Workout Plans**: Create, manage, and track workout routines
- **Meal Plans**: Nutrition planning with macro tracking
- **Weight Tracking**: Monitor client progress over time
- **Content Management**: Testimonials, videos, and homepage content
- **API Documentation**: Comprehensive Swagger documentation

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with Passport
- **Validation**: Class Validator
- **Documentation**: Swagger/OpenAPI
- **Development**: Nodemon for hot reload

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn

## 🔧 Installation

1. **Clone and navigate to the backend directory**:
   ```bash
   cd backend/pt-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/pt_database"
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV=development
   ```

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The API will be available at:
- **API**: http://localhost:3001
- **Swagger Documentation**: http://localhost:3001/api

## 📚 API Documentation

The API includes comprehensive Swagger documentation available at `/api` endpoint. Key features include:

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile

### User Management
- `GET /users` - List all users (Admin only)
- `POST /users` - Create new user (Admin only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

### Workout Plans
- `GET /workout-plans` - List workout plans
- `POST /workout-plans` - Create workout plan
- `GET /workout-plans/:id` - Get workout plan details
- `PATCH /workout-plans/:id` - Update workout plan
- `DELETE /workout-plans/:id` - Delete workout plan
- `POST /workout-plans/:id/duplicate` - Duplicate plan (Admin only)

### Meal Plans
- `GET /meal-plans` - List meal plans
- `POST /meal-plans` - Create meal plan
- `GET /meal-plans/:id` - Get meal plan details
- `PATCH /meal-plans/:id` - Update meal plan
- `DELETE /meal-plans/:id` - Delete meal plan
- `POST /meal-plans/:id/duplicate` - Duplicate plan (Admin only)

### Weight Records
- `GET /weight-records` - List weight records
- `POST /weight-records` - Create weight record
- `GET /weight-records/chart/:clientId` - Get weight chart data
- `PATCH /weight-records/:id` - Update weight record
- `DELETE /weight-records/:id` - Delete weight record

### Content Management
- `GET /testimonials/published` - Get published testimonials (Public)
- `GET /videos/published` - Get published videos (Public)
- `GET /contact-info/current` - Get current contact info (Public)
- `GET /home-content/current` - Get current homepage content (Public)

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Login Credentials

After running the seed script, you can use these credentials:

**Admin Account**:
- Email: `admin@phinpt.com`
- Password: `admin123`

**Client Account**:
- Email: `client@example.com`
- Password: `client123`

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: Admin and client accounts
- **WorkoutPlans**: Training programs with exercises and sets
- **MealPlans**: Nutrition plans with meals and foods
- **WeightRecords**: Client weight tracking
- **Testimonials**: Client reviews and feedback
- **Videos**: Training videos and tutorials
- **ContactInfo**: Business contact information
- **HomeContent**: Homepage content management

## 🔧 Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with sample data
npm run db:seed
```

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and client role separation
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Configurable cross-origin requests

## 📊 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📝 Development Guidelines

1. **Code Style**: Follow NestJS conventions and use ESLint/Prettier
2. **Validation**: Use class-validator for all DTOs
3. **Error Handling**: Implement proper error handling with HTTP status codes
4. **Documentation**: Update Swagger documentation for new endpoints
5. **Security**: Always validate user permissions for protected routes

## 🚀 Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Start the production server**:
   ```bash
   npm run start:prod
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.