import { Module } from '@nestjs/common';
import { ScheduleOverlapService } from './schedule-overlap.service';

@Module({
  providers: [ScheduleOverlapService],
  exports: [ScheduleOverlapService], // Lo exportamos para usarlo luego en TeacherAssignments
})
export class SchedulesModule {}