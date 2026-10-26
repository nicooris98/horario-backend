import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleOverlapService } from './schedule-overlap.service';
import { SchedulesService } from './schedules.service'; 
import { Day } from './entities/day.entity';
import { Schedule } from './entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Day, Schedule])],
  providers: [ScheduleOverlapService, SchedulesService], 
  exports: [ScheduleOverlapService, SchedulesService], 
})
export class SchedulesModule {}