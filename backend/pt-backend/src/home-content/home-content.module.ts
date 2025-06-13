import { Module } from '@nestjs/common';
import { HomeContentService } from './home-content.service';
import { HomeContentController } from './home-content.controller';

@Module({
  controllers: [HomeContentController],
  providers: [HomeContentService],
})
export class HomeContentModule {}