import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanAcademicCycle } from './entities/study_plan_academic_cycle.entity';
import { StudyPlanAcademicCyclesController } from './study_plan_academic_cycles.controller';
import { StudyPlanAcademicCyclesService } from './study_plan_academic_cycles.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlanAcademicCycle])],
  controllers: [StudyPlanAcademicCyclesController],
  providers: [StudyPlanAcademicCyclesService],
})
export class StudyPlanAcademicCyclesModule {}
