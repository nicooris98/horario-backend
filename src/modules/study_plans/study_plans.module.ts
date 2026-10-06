import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from './entities/study_plans.entity';
import { StudyPlanController } from './study_plans.controller';
import { StudyPlanService } from './study_plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan])],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
})
export class StudyPlanModule {}
