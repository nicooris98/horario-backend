import { Module } from '@nestjs/common';
import { StudyPlanShiftsService } from './study_plan_shifts.service';
import { StudyPlanShiftsController } from './study_plan_shifts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanShift } from './entities/study_plan_shift.entity';
import { StudyPlan } from '../study_plans/entities/study_plans.entity';
import { Shift } from '../shifts/entities/shifts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlanShift, StudyPlan, Shift])],
  controllers: [StudyPlanShiftsController],
  providers: [StudyPlanShiftsService],
})
export class StudyPlanShiftsModule {}
