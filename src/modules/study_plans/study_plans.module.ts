import { Module } from '@nestjs/common';
import { StudyPlanService } from './study_plans.service';
import { StudyPlanController } from './study_plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from './entities/study_plans.entity';
import { Degree } from '../degrees/entities/degrees.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyPlan, Degree])
  ],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
})
export class StudyPlanModule {}
