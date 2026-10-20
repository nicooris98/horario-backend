import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanAcademicCycle } from './entities/study-plan-academic-cycle.entity';
import { StudyPlanAcademicCyclesController } from './study-plan-academic-cycles.controller';
import { StudyPlanAcademicCyclesService } from './study-plan-academic-cycles.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlanAcademicCycle])],
  controllers: [StudyPlanAcademicCyclesController],
  providers: [StudyPlanAcademicCyclesService],
})
export class StudyPlanAcademicCyclesModule {}
