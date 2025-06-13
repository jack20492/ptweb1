import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { ExercisesModule } from './exercises/exercises.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { MealsModule } from './meals/meals.module';
import { WeightRecordsModule } from './weight-records/weight-records.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { VideosModule } from './videos/videos.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { HomeContentModule } from './home-content/home-content.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkoutPlansModule,
    ExercisesModule,
    MealPlansModule,
    MealsModule,
    WeightRecordsModule,
    TestimonialsModule,
    VideosModule,
    ContactInfoModule,
    HomeContentModule,
  ],
})
export class AppModule {}