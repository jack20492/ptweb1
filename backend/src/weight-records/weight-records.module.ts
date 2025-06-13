import { Module } from '@nestjs/common';
import { WeightRecordsService } from './weight-records.service';
import { WeightRecordsController } from './weight-records.controller';

@Module({
  controllers: [WeightRecordsController],
  providers: [WeightRecordsService],
  exports: [WeightRecordsService],
})
export class WeightRecordsModule {}